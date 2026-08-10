import express from "express";
import {
	loginUser,
	logoutUser,
	registerUser,
} from "../controllers/authController.js";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

export default router;
