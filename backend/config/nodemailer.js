import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

transporter.verify((error, success) => {
	if (error) {
		console.error("SMTP ERROR:", error);
	} else {
		console.log("SMTP SERVER READY:", success);
	}
});