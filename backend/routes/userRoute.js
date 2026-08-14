import express from "express";
import {
	resetPassword,
	sendResetOtp,
	isAuthenticated,
	loginUser,
	logoutUser,
	registerUser,
	verifyEmail,
	verifyOtp,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js"
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/send-verify-otp").post(userAuth, verifyOtp);
router.route("/verify-account").post(userAuth, verifyEmail);
router.route("/is-auth").get(userAuth, isAuthenticated);
router.route("/send-reset-otp").post(sendResetOtp);
router.route("/reset-password").post(resetPassword);
router.route("/user-details").get(userAuth, getUserData);

export default router;
