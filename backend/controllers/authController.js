import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import brevo from "../config/brevo.js";
import {
	EMAIL_VERIFY_TEMPLATE,
	PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

// Helper function to send emails cleanly using modern SDK syntax
const sendEmail = async ({ toEmail, toName, subject, html, text }) => {
	await brevo.transactionalEmails.sendTransacEmail({
		subject,
		sender: { name: "MERN", email: process.env.SENDER_EMAIL },
		to: [{ email: toEmail, name: toName || "" }],
		htmlContent: html,
		textContent: text,
	});
};

//@desc Register User
//method POST
//Access public
export const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req?.body || {};

	if (!name || !email || !password) {
		return res.status(400).json({ success: false, message: "Missing Details" });
	}

	const existingUser = await userModel.findOne({ email });
	if (existingUser) {
		return res
			.status(409)
			.json({ success: false, message: "User with this Email already exists" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const user = new userModel({ name, email, password: hashedPassword });
	await user.save();

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	// Send Welcome Email
	await sendEmail({
		toEmail: email,
		toName: name,
		subject: "Welcome to the MERN",
		text: `Welcome to MERN website. Your account has been created with email id: ${email}`,
	});

	return res
		.status(201)
		.json({ success: true, message: "User created successfully" });
});

//@desc User Login
//method POST
//Access public
export const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req?.body || {};

	if (!email || !password) {
		return res.status(400).json({ success: false, message: "Missing Details" });
	}

	const user = await userModel.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		await sendEmail({
			toEmail: email,
			toName: user.name,
			subject: "Login Attempt Alert",
			text: `Hey ${user.name}!, someone logged into your MERN account. If this was you, ignore this message.`,
		});

		return res
			.status(200)
			.json({ success: true, message: "User logged in successfully" });
	} else {
		return res
			.status(400)
			.json({ success: false, message: "Invalid Email or Password" });
	}
});

export const logoutUser = asyncHandler(async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
	});
	return res
		.status(200)
		.json({ success: true, message: "Logged Out Successfully" });
});

export const verifyOtp = asyncHandler(async (req, res) => {
	const userId = req.userId;
	const user = await userModel.findById(userId);

	if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	if (user.isAccountVerified) {
		return res
			.status(400)
			.json({ success: false, message: "Account already verified" });
	}

	const otp = String(Math.floor(100000 + Math.random() * 900000));

	user.vetifyOtp = otp;
	user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
	await user.save();

	await sendEmail({
		toEmail: user.email,
		toName: user.name,
		subject: "Account Verification OTP",
		html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
			"{{email}}",
			user.email,
		),
	});

	return res
		.status(200)
		.json({ success: true, message: "Verification OTP sent on Email" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
	console.log(req.body)
	const { otp } = req?.body || {};
	const userId = req.userId;

	console.log(otp, userId)

	if (!userId || !otp) {
		return res.status(400).json({ success: false, message: "Missing Details" });
	}

	const user = await userModel.findById(userId);

	console.log(user)
	if (!user) {
		console.log("Here")
		return res.status(404).json({ success: false, message: "User not found" });
	}

	if (!user.vetifyOtp || user.vetifyOtp !== otp) {
		console.log("Here 2");
		return res.status(400).json({ success: false, message: "Invalid OTP" });
	}

	if (user.verifyOtpExpireAt < Date.now()) {
		console.log("Here 3");
		return res.status(400).json({ success: false, message: "OTP Expired" });
	}

	user.isAccountVerified = true;
	user.verifyOtp = "";
	user.verifyOtpExpireAt = 0;
	await user.save();

	return res
		.status(200)
		.json({ success: true, message: "Email Verified successfully" });
});

export const isAuthenticated = asyncHandler(async (req, res) => {
	return res.json({ success: true });
});

export const sendResetOtp = asyncHandler(async (req, res) => {
	const { email } = req?.body || {};

	if (!email) {
		return res.status(400).json({ success: false, message: "Email Required" });
	}

	const user = await userModel.findOne({ email });
	if (!user) {
		return res
			.status(400)
			.json({ success: false, message: `User with ${email} not found` });
	}

	const otp = String(Math.floor(100000 + Math.random() * 900000));
	user.resetOtp = otp;
	user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
	await user.save();

	await sendEmail({
		toEmail: email,
		toName: user.name,
		subject: "Password Reset OTP",
		html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
			"{{email}}",
			user.email,
		),
	});

	return res.json({ success: true, message: `OTP sent to ${email}` });
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { email, otp, newPassword } = req?.body || {};

	if (!email || !otp || !newPassword) {
		return res
			.status(400)
			.json({
				success: false,
				message: "Email, OTP and New Password are required",
			});
	}

	const user = await userModel.findOne({ email });
	if (!user) {
		return res.status(400).json({ success: false, message: "User not found!" });
	}

	if (!user.resetOtp || user.resetOtp !== otp) {
		return res.status(400).json({ success: false, message: "Invalid OTP" });
	}

	if (user.resetOtpExpireAt < Date.now()) {
		return res.status(400).json({ success: false, message: "OTP Expired" });
	}

	user.password = await bcrypt.hash(newPassword, 10);
	user.resetOtp = "";
	user.resetOtpExpireAt = 0;
	await user.save();

	return res.json({ success: true, message: "Password reset successfully" });
});
