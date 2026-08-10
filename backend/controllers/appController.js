import express from "express";
import asyncHandler from "express-async-handler";

export const connectApp = (req, res) => {
	res.send("You have reaced the damn restaurant");
};