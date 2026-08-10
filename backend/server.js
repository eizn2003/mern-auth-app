import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/userRoute.js"


connectDB();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.use('/api/users', userRoute)

app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
