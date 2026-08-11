import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";
import { transporter } from "../config/nodemailer.js";

//@desc Register User
//method POST
//Access public
export const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req?.body || {};

	//check id client data is full
	if (!name || !email || !password) {
		return res.status(400).json({ Success: false, message: "Missing Details" });
	}

	//check if user already exists
	const existingUser = await userModel.findOne({ email });

	if (existingUser) {
		return res
			.status(409)
			.json({ Success: false, message: "User with this Email already exists" });
	}

	//Hash user password
	const hashedPassword = await bcrypt.hash(password, 10);

	//Create new User
	const user = new userModel({ name, email, password: hashedPassword });

	//save user in database
	await user.save();

	//Generate JWT
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000, //expires in 7 days
	});

	//Send Welcome Email
	const mailOptions = {
		from: process.env.SENDER_EMAIL,
		to: email,
		subject: "Welcome to the MERN",
		text: `Welome to MERN website. your account has been created with email id: ${email}`,
	};

	await transporter.sendMail(mailOptions);

	return res
		.status(201)
		.json({ Success: true, message: "User created successfully" });
});

//@desc User Login
//method POST
//Access public
export const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req?.body || {};

	//check id client data is full
	if (!email || !password) {
		return res.status(400).json({ Success: false, message: "Missing Details" });
	}

	//check if user exists
	const user = await userModel.findOne({ email });

	//Send Alert Email
	const mailOptions = {
		from: process.env.SENDER_EMAIL,
		to: email,
		subject: `Login Attepmt`,
		text: `Hey ${user.name}!, someone attempted login with your MERN account, if it was you ignore the message if it wasn't you contact our support team ASAP.`,
	};

	await transporter.sendMail(mailOptions);

	if (user && (await user.matchPassword(password))) {
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, //expires in 7 days
		});

		return res
			.status(200)
			.json({ Success: true, message: "User logged in successfully" });
	} else {
		return res
			.status(400)
			.json({ Success: false, message: "Invalid Email or Password" });
	}
});

export const logoutUser = asyncHandler(async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
	});

	res.status(200).json({ Success: true, message: "Logged Out Successfully" });
});

export const verifyOtp = asyncHandler(async (req, res) => {
	const userId = req.userId;

	const user = await userModel.findById(userId);

	if (user.isAccountVerified) {
		return res
			.status(400)
			.json({ Success: false, message: "Account already verified" });
	}

	const otp = String(Math.floor(100000 + Math.random() * 900000));

	user.vetifyOtp = otp;
	user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

	await user.save();

	//Send OTP Email
	const mailOptions = {
		from: process.env.SENDER_EMAIL,
		to: user.email,
		subject: `Account Verification OTP`,
		text: `Hey ${user.name}!, Here is you account verification OTP number: ${otp}`,
	};

	await transporter.sendMail(mailOptions);

	return res
		.status(400)
		.json({ Success: true, message: "Verification OTP sent on Email" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
	const { otp } = req?.body || {};
	const userId = req.userId;

	if (!userId || !otp) {
		return res.status(400).json({ success: false, message: "Missing Details" });
	}

	const user = await userModel.findById(userId);

	if (!user) {
		return res.json({ success: false, message: "User nor found" });
	}

	console.log(user.vetifyOtp)

	if (user.vetifyOtp === "" || user.vetifyOtp !== otp) {
		return res.status(400).json({ success: false, message: "Invalid OTP" });
	}

	if (user.verifyOtpExpireAt < Date.now()) {
		return res.json({ success: false, message: "OTP Expired" });
	}

	user.isAccountVerified = true;
	user.vetifyOtp = "";
	user.verifyOtpExpireAt = 0;

	await user.save();
	return res.json({ success: true, message: "Email Verified successfully" });
});

export const isAuthenticated = asyncHandler(async(req, res) => {
	return res.json({success: true})
})