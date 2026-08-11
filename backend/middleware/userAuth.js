import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const userAuth = asyncHandler(async (req, res, next) => {
	const { token } = req.cookies;
    console.log(token)
	if (!token) {
		return res
			.status(401)
			.json({ success: false, message: "Not authorized. Login Again!" });
	}

	const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)

	if (decodedToken.id) {
		req.userId = decodedToken.id;
	} else {
		return res.json({
			success: false,
			message: "Not Authorized. Login Again!",
		});
	}

	next();
});
