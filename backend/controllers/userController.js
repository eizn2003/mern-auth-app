import { userModel } from "../models/userModel.js";
import asyncHandler from "express-async-handler";


export const getUserData = asyncHandler(async (req, res) => {
	const userId = req.userId;

	if(!userId){
		return res.status(401).send("Not Authorized");
	}

	const user = await userModel.findById(userId);

	if(!user){
		return res.status(400).send("User not found");
	}

	res.status(200).json({
		success: true,
		userData: {
			name: user.name,
			email: user.email,
			isVerified: user.isAccountVerified,
		}
	});
})