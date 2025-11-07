
import {  loginUserSchema, registerUserSchema, verifyEmailSchema } from "../validators/auth-validators.js"

import { authenticateuserSession, clearSession, clearVerifyEmailToken, comparepassword, createAccesstoken, createRefreshtoken, createSession, createUser, createverifyEmailLink, finduserbyId, findVerificationEmailToken, generateRandomToken, getAllShortLinks, getuserEmailexist, hashpassword, insertVerifyEmailToken, sendNewVerifyEmailLink, VerifyuserEmailandUpdate } from "../services/auth.services.js"
// import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { sendEmail } from "../lib/nodemailer.js";



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

export const getProfilePage=async(req,res)=>{
  if (!req.user) return res.send("Not logged in");
const user = await finduserbyId(req.user.id)
if (!user) {
  return res.redirect("/login")
}
console.log('User data:', user);
const userShortLinks = await getAllShortLinks(user.id)
return res.render("auth/profile",{user:{
  id:user.id,
  name:user.name,
  email:user.email,
  isEmailValid:user.isEmailValid,
  createdAt:user.createdAt,
  links:userShortLinks,
}})
}

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