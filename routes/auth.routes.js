import { Router } from 'express';
import * as authControllers from '../controllers/auth.controllers.js';
import multer from 'multer';
import path from 'path'
const router = Router();


router.get('/home', authControllers.gethomePage)
router.get('/', authControllers.gethomePage)
router.route("/logout").get(authControllers.logoutUser)
router.route("/login").get(authControllers.getLoginPage).post(authControllers.postlogin)
router.route("/register").get(authControllers.getRegisterPage).post(authControllers.postRegister)
// router.route("/profile").get(authControllers.getProfilePage) -profileHandler
// router.route("/edit-profile").get(authControllers.geteditProfilePage).post(authControllers.posteditProfilrPage)
const avatarStorage = multer.diskStorage({
 destination:(req,file,cb)=>{
  cb(null,"public/uploads/avatar")
 },
 filename:(req,file,cb)=>{
const ext = path.extname(file.originalname)
cb(null,`${Date.now()}_${Math.random()}${ext}`)
 }
})

const avatarFileFilter=(req,file,cb)=>{
if(file.mimetype.startsWith("image/")){
cb(null,true)
} else{
  cb( new Error("Only Image Files are allowed!"),false)
}
}

const avatarUpload = multer({
  storage:avatarStorage,
  fileFilter:avatarFileFilter,
  limits:{fileSize:5*1024*1024}, //5 MB
})

router
  .route("/profile")
  .get(authControllers.profileHandler)
  .post(
    avatarUpload.single("avatar"),
    authControllers.postProfileUpdate
  );

  // .post(authControllers.postProfileUpdate);
router.route("/change-password").get(authControllers.getchangepassword).post(authControllers.postchangePassword)
router.route("/reset-password").get(authControllers.getResetPasswordPage).post(authControllers.postFogotPasswordPage)
router.route("/reset-password/:token").get(authControllers.getResetPasswordTokenPage).post(authControllers.postResetPasswordToken)
router.route("/verify-email").get(authControllers.getVerifyEmailPage)
router.route("/resend-verification-link").post(authControllers.resendVerificationLink)
router.route("/verify-email-token").get(authControllers.verifyEmailToken)
router.route("/google").get(authControllers.googleLoginPage)
router.route("/google/callback").get(authControllers.getGoogleLoginCallback)
router.route("/github").get(authControllers.githubLoginPage)
router.route("/github/callback").get(authControllers.githubLoginCallback)
router.route("/set-password").get(authControllers.getSetPasswordPage).post(authControllers.postSetPasswodPage)
router.route("/me").get(authControllers.getme)
export const authroute = router;