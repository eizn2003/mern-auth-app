import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		vetifyOtp: { type: String, default: "" },
		verifyOtpExpireAt: { type: Number, default: 0 },
		isAccountVerified: { type: Boolean, default: false },
		resetOtp: { type: String, default: "" },
		resetOtpExpireAt: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	},
);

userSchema.methods.matchPassword = async function(enteredPassword){

    //this.password is the password stored in database
    return await bcrypt.compare(enteredPassword, this.password)
}

export const userModel = mongoose.models.users || mongoose.model('User', userSchema)