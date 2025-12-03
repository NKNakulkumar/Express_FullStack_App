import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  oAuthAccountsTable,
  passwordresetTokenTable,
  sessionsTale,
  shortLink,
  UserData,
  VerifyEmailTokenTable,
} from "../drizzle/schema.js";
import argon2 from "argon2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
// import { sendEmail } from "../lib/nodemailer.js";
import { sendEmail } from "../lib/send-email.js";
import { readFile } from "fs/promises";
import path from "path";
import ejs from "ejs";
import mjml2html from "mjml";

export const getuserEmailexist = async (email) => {
  const [user] = await db
    .select()
    .from(UserData)
    .where(eq(UserData.email, email));
  return user;
};

export const createUser = async ({ name, email, password }) => {
  return await db
    .insert(UserData)
    .values({ name, email, password })
    .$returningId();
};

export const hashpassword = async (password) => {
  return await argon2.hash(password);
};

export const comparepassword = async (password, hashpassword) => {
  try {
    return await argon2.verify(hashpassword, password);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
};

// UpdateUserPassword
export const UpdateUserPassword = async ({ userId, newPassword }) => {
  const newHashPassword = await hashpassword(newPassword);
  return db
    .update(UserData)
    .set({ password: newHashPassword })
    .where(eq(UserData.id, userId));
};

// export const generateToken=({id,name,email})=>{
// return jwt.sign({id,name,email},process.env.JWT_SECERET,{
//   expiresIn:"30d"
// })

// }

export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTale)
    .values({ userId, ip, userAgent })
    .$returningId();
  return session;
};

export const createAccesstoken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECERET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // expired in 15 min
  });
};

export const createRefreshtoken = ({ sessionId }) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECERET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // convert ms → seconds
  });
};

export const verifyjwtToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECERET);
};
// findSessionbyId
export const findSessionbyId = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTale)
    .where(eq(sessionsTale.id, sessionId));
  return session;
};
//finduserbyId
export const finduserbyId = async (userId) => {
  const [user] = await db
    .select()
    .from(UserData)
    .where(eq(UserData.id, userId));
  return user;
};

// refreshTokenfun

export const refreshTokenfun = async (refreshToken) => {
  try {
    const decodedToken = verifyjwtToken(refreshToken);
    const currentsession = await findSessionbyId(decodedToken.sessionId);

    if (!currentsession || !currentsession.id) {
      throw new Error("Invalid Session");
    }

    const user = await finduserbyId(currentsession.userId);
    if (!user) {
      throw new Error("Invalid User");
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentsession.id,
    };
    const newAccessToken = createAccesstoken(userInfo);

    const newRefreshToken = createRefreshtoken(currentsession.id);

    return { newAccessToken, newRefreshToken, user: userInfo };
  } catch (error) {
    console.error("refreshTokenfun error:", error.message);
    // ✅ FIX: always return a consistent structure, even on error
    return { newAccessToken: null, newRefreshToken: null, user: null };
  }
};

// clearSession

export const clearSession = async (sessionId) => {
  await db.delete(sessionsTale).where(eq(sessionsTale.id, sessionId));
};

export const authenticateuserSession = async ({
  req,
  res,
  user,
  name,
  email,
}) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccesstoken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshtoken({ sessionId: session.id });
  const baseconfig = { httpOnly: true, secure: true };
  res.cookie("Access_token", accessToken, {
    ...baseconfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  //
  res.cookie("Refresh_token", refreshToken, {
    ...baseconfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

// getAllShortLinks
export const getAllShortLinks = async (userId) => {
  return await db.select().from(shortLink).where(eq(shortLink.userId, userId));
};

export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1); //10000000
  const max = 10 ** digit; // 100000000

  return crypto.randomInt(min, max).toString();
};

export const insertVerifyEmailToken = async ({ userId, token }) => {
  // console.log("Token",token)
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(VerifyEmailTokenTable)
        .where(lt(VerifyEmailTokenTable.expiresAt, sql`CURRENT_TIMESTAMP`));
      // delete the existing Token.
      await tx
        .delete(VerifyEmailTokenTable)
        .where(eq(VerifyEmailTokenTable.userId, userId));
      // Insert the new token
      return await tx.insert(VerifyEmailTokenTable).values({ userId, token });
    } catch (error) {
      console.log("Failed to insert verification Token", error);
      throw new Error("Unable to create verification token ");
    }
  });
};

// createverifyEmailLink

export const createverifyEmailLink = ({ email, token }) => {
  // const uriEncoded = encodeURIComponent(email);
  // return `${process.env.FRONTENED_URL}/verify-email-token?token=${token}&email=${uriEncoded}`;

  const url = new URL(`${process.env.FRONTENED_URL}/verify-email-token`);

  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

// findVerificationEmailToken

// export const findVerificationEmailToken = async ({ token, email }) => {
//   const tokendata = await db
//     .select({
//       userId: VerifyEmailTokenTable.userId,
//       token: VerifyEmailTokenTable.token,
//       expiresAt: VerifyEmailTokenTable.expiresAt,
//     })
//     .from(VerifyEmailTokenTable)
//     .where(
//       and(
//         eq(VerifyEmailTokenTable.token, token),
//         gte(VerifyEmailTokenTable.expiresAt, sql`CURRENT_TIMESTAMP`)
//       )
//     );

//     if(!tokendata.length){
//       return null
//     }

//     const {userId} = tokendata[0]

//     const userdata = await db.select({userId:UserData.id,email:UserData.email}).from(UserData).where(eq(UserData.id,userId))
//        if(!userdata.length){
//       return null
//     }

//     return {
//       userId:userdata[0].userId,
//       email:userdata[0].email,
//       token:tokendata[0].token,
//       expiresAt:tokendata[0].expiresAt,
//     }
// };
export const findVerificationEmailToken = async ({ token, email }) => {
  console.log("Token", token);
  return db
    .select({
      userId: UserData.id,
      email: UserData.email,
      token: VerifyEmailTokenTable.token,
      expiresAt: VerifyEmailTokenTable.expiresAt,
    })
    .from(VerifyEmailTokenTable)
    .where(
      and(
        eq(VerifyEmailTokenTable.token, token),
        eq(UserData.email, email),
        gte(VerifyEmailTokenTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    )
    .innerJoin(UserData, eq(VerifyEmailTokenTable.userId, UserData.id));
};

// VerifyuserEmailandUpdate

export const VerifyuserEmailandUpdate = async (email) => {
  return db
    .update(UserData)
    .set({ isEmailValid: true })
    .where(eq(UserData.email, email));
};

// clearVerifyEmailToken

export const clearVerifyEmailToken = async ({ email }) => {
  const [user] = await db
    .select()
    .from(UserData)
    .where(eq(UserData.email, email));
  return await db
    .delete(VerifyEmailTokenTable)
    .where(eq(VerifyEmailTokenTable.userId, user.id));
};

export const sendNewVerifyEmailLink = async ({ userId, email }) => {
  const randomToken = generateRandomToken();

  await insertVerifyEmailToken({ userId, token: randomToken });

  const verifyEmalLink = createverifyEmailLink({
    email,
    token: randomToken,
  });

  //1 to get the file data -
  const mjmldata = await readFile(
    path.join(import.meta.dirname, "..", "emails", "verify-email.mjml"),
    "utf-8"
  );
  // 2 to replace the placeholders with the actual values .
  const fieldTemplete = ejs.render(mjmldata, {
    code: randomToken,
    link: verifyEmalLink,
  });

  // 3 to convert mjml to html .
  const htmlOutput = mjml2html(fieldTemplete).html;

  sendEmail({
    to: email,
    subject: "Verify your email",
    html: htmlOutput,
  }).catch("Error", console.error);
};

// UpdateUserByName
export const UpdateUserByName = async ({ userId, name }) => {
  return await db
    .update(UserData)
    .set({ name: name })
    .where(eq(UserData.id, userId));
};

// finduserbyEmail
export const finduserbyEmail = async (email) => {
  const [user] = await db
    .select()
    .from(UserData)
    .where(eq(UserData.email, email));
  return user;
};

export const CreateResetPasswordLink = async ({ userId }) => {
  const randomToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  await db
    .delete(passwordresetTokenTable)
    .where(eq(passwordresetTokenTable.userId, userId));
  await db.insert(passwordresetTokenTable).values({ userId, tokenHash });
  return `${process.env.FRONTENED_URL}/reset-password/${randomToken}`;
};
// 1 Random token generate
//2 convert int hash token
// 3 clear the previous token
// 4 now wened to inser usedId , hastoken
// 5 return the link

export const getResetPasswordToken = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const [data] = await db
    .select()
    .from(passwordresetTokenTable)
    .where(
      and(
        eq(passwordresetTokenTable.tokenHash, tokenHash),
        gte(passwordresetTokenTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    );
 return data ?? null; // return first row or null
};

// ClearResetPasswordToken

export const ClearResetPasswordToken = async (userId) => {
  return await db
    .delete(passwordresetTokenTable)
    .where(eq(passwordresetTokenTable.userId, userId));
};

// getUserWithOauthId
export const getUserWithOauthId =async({email,provider})=>{

  const [user] = await db.select({id:UserData.id,name:UserData.id,email:UserData.email,isEmailValid:UserData.isEmailValid,providerAccountId:oAuthAccountsTable.providerAccountId}).from(UserData).where(eq(UserData.email,email)).leftJoin(oAuthAccountsTable,and(eq(oAuthAccountsTable.provider,provider),eq(oAuthAccountsTable.userId,UserData.id)))
return user;

}

export const linkUserWithOauth =async({userId,provider,providerAccountId})=>{
await db.insert(oAuthAccountsTable).values({
  userId,
  provider,
  providerAccountId
})

}

export const CreateUserWithAuth=async({name,email,provider,providerAccountId})=>{

  const user = await db.transaction(async(trx)=>{
    const [user] = await trx.insert(UserData).values({name,email,isEmailValid:true}).$returningId();

    await trx.insert(oAuthAccountsTable).values({
      provider,
      providerAccountId,
      userId:user.id
    })

    return{
      id:user.id,
      name,
      email,
      isEmailValid:true,
       provider,
      providerAccountId,
 
    }

  })
      return user ;
}