import express from "express";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {console.log(`server running on port ${PORT}`)};
