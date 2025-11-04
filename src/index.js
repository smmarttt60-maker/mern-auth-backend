//    
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";

import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.handler.js";

dotenv.config();

const app = express();

//  Security Middlewares
app.use(helmet());                // Security headers
app.use(mongoSanitize());         // Prevent NoSQL injection
app.use(xssClean());              // Prevent XSS attacks

//  Basic Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

//  Rate Limiter (important)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later."
});
app.use("/api", limiter);  // apply limiter to all /api routes

//  Routes
app.use("/api/auth", authRoutes);

//  Test Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Auth backend running" });
});

//  Error Handler (must be last)
app.use(errorHandler);

//  Connect DB + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on PORT ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log("DB Error:", err));
