import { Router } from 'express';
import * as authControllers from '../controllers/auth.controllers.js';

const router = Router();


router.get('/home', authControllers.gethomePage)
router.get('/', authControllers.gethomePage)
router.route("/logout").get(authControllers.logoutUser)
router.route("/login").get(authControllers.getLoginPage).post(authControllers.postlogin)
router.route("/register").get(authControllers.getRegisterPage).post(authControllers.postRegister)
router.route("/profile").get(authControllers.getProfilePage)
router.route("/verify-email").get(authControllers.getVerifyEmailPage)
router.route("/resend-verification-link").post(authControllers.resendVerificationLink)
router.route("/verify-email-token").get(authControllers.verifyEmailToken)
router.route("/me").get(authControllers.getme)
export const authroute = router;