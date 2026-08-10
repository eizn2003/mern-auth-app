import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

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

	if (!(user && user.matchPassword(password))) {
		return res
			.status(400)
			.json({ Success: false, message: "Invalid Email or Password" });
	} else {
	return res
		.status(200)
		.json({ Success: true, message: "User logged in successfully" });
    }

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000, //expires in 7 days
	});

});

export const logoutUser = asyncHandler(async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
	});

    res.status(200).json({Success: true, message: 'Logged Out Successfully'})
});
