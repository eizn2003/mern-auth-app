import express from "express";
import {
	isAuthenticated,
	loginUser,
	logoutUser,
	registerUser,
	verifyEmail,
	verifyOtp,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/send-verify-otp").post(userAuth, verifyOtp);
router.route("/verify-account").post(userAuth, verifyEmail);
router.route("/is-auth").post(userAuth, isAuthenticated);

export default router;
