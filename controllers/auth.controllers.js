
import {  fogotPasswordSchema, loginUserSchema, registerUserSchema, SetPasswordSchema, VerifUsereditSchema, verifyEmailSchema, VerifyPasswordSchem, VerifyResetPasswordSchema } from "../validators/auth-validators.js"

import { authenticateuserSession, ClearResetPasswordToken, clearSession, clearVerifyEmailToken, comparepassword, createAccesstoken, createRefreshtoken, CreateResetPasswordLink, createSession, createUser, CreateUserWithAuth, createverifyEmailLink, finduserbyEmail, finduserbyId, findVerificationEmailToken, generateRandomToken, getAllShortLinks, getResetPasswordToken, getuserEmailexist, getUserWithOauthId, hashpassword, insertVerifyEmailToken, linkUserWithOauth, sendNewVerifyEmailLink, UpdateUserByName, UpdateUserPassword, VerifyuserEmailandUpdate } from "../services/auth.services.js"
// import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { sendEmail } from "../lib/send-email.js";
import { gethtmlfromMjmltemplate } from "../lib/get-mjml-to-html-template.js";
import { decodeIdToken, generateCodeVerifier, generateState, Google } from "arctic";
import { OAUTH_EXCHNAGE_EXPIRY } from "../config/constants.js";
import { google } from "../lib/oauth/google.js";
import { github } from "../lib/oauth/github.js";




export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/home");
  return res.render("auth/register", { errors: req.flash("errors") });
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/home");
  return res.render("auth/login", { errors: req.flash("errors") });
};

export const gethomePage = (req, res) => {
  if (!req.user) return res.redirect("/login"); // fix: user must be logged in
  return res.render("auth/home", { user: req.user });
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/home");

  const result = registerUserSchema.safeParse(req.body);

if (!result.success) {
  const firstError = result.error.issues[0].message;
  req.flash("errors", firstError);
  return res.redirect("/register");
}

const { name, email, password } = result.data;

  const userExist = await getuserEmailexist(email);

  if (userExist) {
    req.flash("errors", "User already exists");
    return res.redirect("/register");
  }

  const hashedPassword = await hashpassword(password);
  const [user] = await createUser({ name, email, password: hashedPassword });

  console.log("User registered:", user);

await authenticateuserSession({req,res,user,name,email})

await sendNewVerifyEmailLink({ email,userId:user.id,})


  return res.redirect("/home");
};

export const postlogin = async (req, res) => {
  if (req.user) return res.redirect("/home");

  const result = loginUserSchema.safeParse(req.body);

if (!result.success) {
  const firstError = result.error.issues[0].message;
  req.flash("errors", firstError);
  return res.redirect("/login");
}

const {  email, password } = result.data;
  const user = await getuserEmailexist(email);

  if (!user) {
    req.flash("errors", "Invalid email or password");
    return res.redirect("/login");
  }

    if (!user.password) {
    req.flash("errors", "You have created account using social login.Please login with social account");
    return res.redirect("/login");
  }

  

  const isPasswordValid = await comparepassword(password, user.password);
  if (!isPasswordValid) {
    req.flash("errors", "Invalid email or password");
    return res.redirect("/login");
  }

  // const token = generateToken({
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  // });

  // res.cookie("Access_token", token, { httpOnly: true });
  // we Need t create a sessions
await authenticateuserSession({req,res,user})

  return res.redirect("/home");
};

export const getme = (req, res) => {
  if (!req.user) return res.send("Not logged in");
  return res.send(`<h1>${req.user.name} - ${req.user.email}</h1>`);
};

export const logoutUser = async(req, res) => {
  await  clearSession(req.user.sessionId)
  res.clearCookie("Access_token");
  res.clearCookie("Refresh_token");
  return res.redirect("/login");
};

// getProfilePage

// export const getProfilePage=async(req,res)=>{
//   if (!req.user) return res.send("Not logged in");
// const user = await finduserbyId(req.user.id)
// if (!user) {
//   return res.redirect("/login")
// }
// console.log('User data:', user);
// const userShortLinks = await getAllShortLinks(user.id)
// return res.render("auth/profile",{user:{
//   id:user.id,
//   name:user.name,
//   email:user.email,
//   isEmailValid:user.isEmailValid,
//   createdAt:user.createdAt,
//   links:userShortLinks,
// }})
// }

// getVerifyEmailPage

export const getVerifyEmailPage=async(req,res)=>{
// if(!req.user|| req.user.isEmailValid) return res.redirect("/home")

  if (!req.user) return  res.redirect("/home")
      const user = await finduserbyId(req.user.id)
if(!user|| user.isEmailValid) return res.redirect("/home")


  return res.render("auth/verify-email"),{
    email:req.user.email,
    
   }
}
// resendVerificationLink

export const resendVerificationLink=async(req,res)=>{
 if (!req.user) return  res.redirect("/home")
      const user = await finduserbyId(req.user.id)
if(!user|| user.isEmailValid) return res.redirect("/home")

await sendNewVerifyEmailLink({ email:req.user.email,userId:req.user.id,})
  res.redirect("/verify-email")
}

// verifyEmailToken

export  const verifyEmailToken=async(req,res)=>{
const {data,error} = verifyEmailSchema.safeParse(req.query) 
if (error) {
  return res.render("Verification link are invalid or expired")
}

const [token] = await findVerificationEmailToken(data)  // with joins
console.log("VerificationEmailToken",token)
if(!token) res.send("Verification link are invalid or expired")

await VerifyuserEmailandUpdate(token.email)

clearVerifyEmailToken(token.email).catch(console.error)

return res.redirect("/profile")
}

// geteditProfilePage

// export const geteditProfilePage=async(req,res)=>{
//  if (!req.user) return  res.redirect("/home")

//   const user = await finduserbyId(req.user.id)
//  if (!user) return  res.status(404).send("User not found");

//  return res.render("auth/edit-profile",{
//   name:user.name,
//   errors:req.flash("errors")
//  })


// }
// // posteditProfilrPage

// export const posteditProfilrPage=async(req,res)=>{
//  if (!req.user) return  res.redirect("/home")

//  const {data,error} =  VerifUsereditSchema.safeParse(req.body)

//  if (error) {
//   const firstError = result.error.issues[0].message;
//   req.flash("errors", firstError);
//   return res.redirect("/edit-profile");
// }

// await UpdateUserByName({userId:req.user.id,name:data.name})
// return res.redirect("/profile")
// }
export const profileHandler = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  try {
    // Fetch logged-in user
    const user = await finduserbyId(req.user.id);
    if (!user) return res.status(404).send("User not found");

    // Decide which view to render based on query param ?mode=edit
    const mode = req.query.mode === "edit" ? "edit" : "view";

    // View profile logic (same as getProfilePage)
    if (mode === "view") {
      console.log("User data:", user);
      const userShortLinks = await getAllShortLinks(user.id);

      return res.render("auth/profile", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailValid: user.isEmailValid,
          hashPassword:Boolean(user.password),
          createdAt: user.createdAt,
          links: userShortLinks,
        },
      });
    }

    // Edit profile logic (same as geteditProfilePage)
    if (mode === "edit") {
      return res.render("auth/profile", {
        editMode: true,
        name: user.name,
        user,
        errors: req.flash("errors"),
      });
    }
  } catch (error) {
    console.error("Profile handler error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const postProfileUpdate = async (req, res) => {
  if (!req.user) return res.redirect("/home");
  

  const { data, error } = VerifUsereditSchema.safeParse(req.body);

  if (error) {
    const firstError = error.issues[0].message;
    req.flash("errors", firstError);
    return res.redirect("/profile?mode=edit"); // stay on same page
  }

  await UpdateUserByName({ userId: req.user.id, name: data.name });
  return res.redirect("/profile"); // reload updated profile
};

// getchangepassword
export const getchangepassword=async(req,res)=>{
  if (!req.user) return res.redirect("/home");

return res.render("auth/change-password",{
  errors:req.flash("errors")
})


}
// postchangePassword
export const postchangePassword=async(req,res)=>{
const {data,error} = VerifyPasswordSchem.safeParse(req.body)
 if (error) {
    const firstError = error.issues[0].message;
    req.flash("errors", firstError);
    return res.redirect("/change-password"); // stay on same page
  }
console.log(data)
const {currentPassword,newPassword} = data
const user=  await finduserbyId(req.user.id)
    if (!user) return res.status(404).send("User not found");


const isPasswordValid =  await comparepassword(currentPassword,user.password)
if (!isPasswordValid) {
  req.flash("errors","Your Current you entered is Invalid")
  return res.redirect("/change-password")
}

await UpdateUserPassword({userId:user.id,password:newPassword})
  return res.redirect("/profile"); 

}


export const getResetPasswordPage = async(req, res) => {
  return res.render("auth/fogot-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors")
  });
};

// postFogotPasswordPage

export const postFogotPasswordPage =async(req,res)=>{
const parsed = fogotPasswordSchema.safeParse(req.body);
console.log("BODY:", req.body);

if (!parsed.success) {
    const firstError = parsed.error.issues[0].message;
    req.flash("errors", firstError);
    return res.redirect("/reset-password"); // stay on same page
}

const data = parsed.data;  
console.log(data);

const user = await finduserbyEmail(data.email);
if (user) {
   // FIX: Ensure user.id is a primitive value, not an object
    // const userId = typeof user.id === 'object' ? user.id.toString() : user.id;
    // console.log("User ID:", userId); // Debug log to verify

  const resetPasswordLink = await CreateResetPasswordLink({userId:user.id});

const html = await gethtmlfromMjmltemplate("reset-password-email",{
  name:user.name,
  link:resetPasswordLink,
})

try {
  await sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    html,
  });
  console.log("EMAIL SENT SUCCESSFULLY");
} catch (err) {
  console.error("EMAIL SEND ERROR:", err);
}
}
// console.log("html",html)
req.flash("formSubmitted",true)
return res.redirect("/reset-password")
}

export const getResetPasswordTokenPage=async(req,res)=>{

  const  {token} = req.params;
    if (!token) {
    return res.redirect("/reset-password"); // Redirect to main reset password page
  }
  const passwordresettoken = getResetPasswordToken(token)
  if (!passwordresettoken) {
    req.flash("errors", "Password reset token is invalid or expired");
    return res.render("auth/wrong-reset-password-token");
  }

    return res.render("auth/reset-password",{
  formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
    token,
  })
}

// postResetPasswordToken

export const postResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Step 1: Validate token exists and is not expired
    const passwordResetTokenData = await getResetPasswordToken(token);
    
    if (!passwordResetTokenData) {
      req.flash("errors", "Password reset token is invalid or expired");
      return res.render("auth/wrong-reset-password-token", {
        errors: req.flash("errors")
      });
    }

    // Step 2: Validate password input
    const result = VerifyResetPasswordSchema.safeParse(req.body);
    
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      req.flash("errors", firstError);
      return res.redirect(`/reset-password/${token}`); // Fixed syntax error
    }

    const { newPassword } = result.data;

    // Step 3: Find user
    const user = await finduserbyId(passwordResetTokenData.userId);
    
    if (!user) {
      req.flash("errors", "User not found");
      return res.render("auth/wrong-reset-password-token", {
        errors: req.flash("errors")
      });
    }

    // Step 4: Update password and clear token
    await UpdateUserPassword({ userId: user.id, newPassword });
    await ClearResetPasswordToken(user.id);
    
    // Step 5: Success - redirect to login
    req.flash("success", "Password successfully reset! Please login with your new password.");
    return res.redirect("/login");

  } catch (error) {
    console.error("Password reset error:", error);
    req.flash("errors", "Something went wrong. Please try again.");
    return res.redirect("/reset-password");
  }
};

export const googleLoginPage=async(req,res)=>{
if(req.user) return res.redirect("/home")

  const state = generateState();
  const codeVerifier = generateCodeVerifier()
  const url =  google.createAuthorizationURL(state,codeVerifier,[
    "openid",
    "profile",
    "email"
  ])

  const cookieConfig = {
	secure: true, // set to false in localhost
	httpOnly: true,
	maxAge: OAUTH_EXCHNAGE_EXPIRY,
  sameSite:"lax"
}
res.cookie("google_oauth_state",state,cookieConfig)
res.cookie("google_oauth_codeVerifier",codeVerifier,cookieConfig)
res.redirect(url.toString())
}

// getGoogleLoginCallback
export const getGoogleLoginCallback = async(req,res)=>{
// google redirect with code , and state in query parameter 
// we will use the code to find out the user
const {code,state} = req.query
console.log(code ,state)

const {google_oauth_state:storedState,
google_oauth_codeVerifier:codeVerifier
} = req.cookies;

if ( !code||!state||!storedState||!codeVerifier||state!==storedState) {
  req.flash("errors","Couldn't login with Google because of Invalid login attempt.Please try again!")
  return res.redirect("/login")
}

let tokens;

try {
  tokens = await google.validateAuthorizationCode(code,codeVerifier);
} catch (error) {
  req.flash("errors","Couldn't login with Google because of Invalid login attempt.Please try again!")
  return res.redirect("/login")
  
}
console.log("Google Tokens",tokens)
// Token is vald now claim
const claims = decodeIdToken(tokens.idToken());
const {sub:googleUserId,name,email} = claims;

// There are few things that we should do 
// condition 1: User already exist with google oauth linked
// condition 2: User already exist with the ame email but google isn't linked.
// condition 3: User doesn't Exist . 

let user = await getUserWithOauthId({
  provider:"google",
  email,
})
if (user && !user.providerAccountId) {
  await linkUserWithOauth({
    userId:user.id,
    provider:"google",
    providerAccountId:googleUserId,
  })
}
if (!user) {
  user = await CreateUserWithAuth({
  name,
  email,
  provider:"google",
  providerAccountId:googleUserId
  })
}
await authenticateuserSession({req,res,user,name,email,})
res.redirect("/home")
}

// githubLoginPage

export const githubLoginPage =async(req,res)=>{
if(req.user) return res.redirect("/home")

  const state = generateState();
  const url =  github.createAuthorizationURL(state,["user:email"])

  const cookieConfig = {
	secure: true, // set to false in localhost
	httpOnly: true,
	maxAge: OAUTH_EXCHNAGE_EXPIRY,
  sameSite:"lax"
}
res.cookie("github_oauth_state",state,cookieConfig)
res.redirect(url.toString())
}

// githubLoginCallback

export const githubLoginCallback=async(req,res)=>{

const {code,state} = req.query
console.log(code ,state)

const {github_oauth_state:storedState,
} = req.cookies;

function handleFailedlogin() {
   req.flash("errors","Couldn't login with GitHub because of Invalid login attempt.Please try again!")
  return res.redirect("/login")
}

if ( !code||!state||!storedState||state!==storedState) {
 return handleFailedlogin()
}

let tokens;

try {
  tokens = await github.validateAuthorizationCode(code);
} catch (error) {
 return handleFailedlogin()
}
console.log("GitHub Tokens",tokens)

const GithubUserRes = await fetch("https://api.github.com/user",{
  headers:{
    Authorization:`Bearer ${tokens.accessToken()}`
  }
})
if (!GithubUserRes.ok) return handleFailedlogin();

const githubUser = await GithubUserRes.json();
const {id:gitHubUserId,name} = githubUser;

const GithubUserEmail = await fetch("https://api.github.com/user/emails",{
  headers:{
    Authorization:`Bearer ${tokens.accessToken()}`
  }
})
if (!GithubUserEmail.ok) return handleFailedlogin();

const emails = await GithubUserEmail.json()
const email = emails.filter((e)=>e.primary)[0].email;
if(!email)  return handleFailedlogin();


// Token is vald now claim
// const claims = decodeIdToken(tokens.idToken());
// const {sub:googleUserId,name,email} = claims;

// There are few things that we should do 
// condition 1: User already exist with google oauth linked
// condition 2: User already exist with the ame email but google isn't linked.
// condition 3: User doesn't Exist . 

let user = await getUserWithOauthId({
  provider:"github",
  email,
})
if (user && !user.providerAccountId) {
  await linkUserWithOauth({
    userId:user.id,
    provider:"github",
    providerAccountId:gitHubUserId,
  })
}
if (!user) {
  user = await CreateUserWithAuth({
  name,
  email,
  provider:"github",
  providerAccountId:gitHubUserId,
  })
}
await authenticateuserSession({req,res,user,name,email,})
res.redirect("/home")
}

// getSetPasswordPage
export const getSetPasswordPage=async(req,res)=>{
if(!req.user) return res.redirect("/home")

  return res.render("auth/set-password",{
    errors:req.flash("errors")
  })

}

// postSetPasswodPage
export const postSetPasswodPage=async(req,res)=>{
if(!req.user) return res.redirect("/home")

  const result = SetPasswordSchema.safeParse(req.body)
if (!result.success) {
  const firstError = result.error.issues[0].message;
  req.flash("errors", firstError);
  return res.redirect("/set-password");
}

const { newPassword} = result.data;
 const user = await finduserbyId(req.user.id)
  if (user.password) {
    req.flash("errors", "You already have password , Instead change your password");
    return res.redirect("/set-password");
  }

await UpdateUserPassword({userId:req.user.id,newPassword})

    return res.redirect("/profile");

}
