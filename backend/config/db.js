import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import 'dotenv/config'
import chalk from 'chalk';
import cookieParser from 'cookie-parser';

export const connectDB = asyncHandler(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(chalk.yellow.underline(`MongoDB connected successfully ${mongoose.connection.host}`));
    } catch (error) {
        console.log("MongoDB connection failed!", error.message)
        process.exit(1);
    }
})
