import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userroute.js";
import authRouter from "./routes/authRoute.js";
import listingRouter from "./routes/listingroute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();

const __dirname = path.resolve();
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Setup CORS with allowed origins
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "https://mern-estate-frontend-zeta.vercel.app",
    ],
    credentials: true,
  })
);

// Middleware for JSON and cookies
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// Simple test API route (put this before catch-all)
app.get("/api", (req, res) => {
  res.send("API is running");
});

// Serve static frontend files if in production
app.use(express.static(path.join(__dirname, "client", "dist")));

// Catch-all to serve React app for any other route (frontend routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Caught Error:", err);
  const statusCode = Number(err.statusCode) || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Favicon route to prevent unnecessary errors
app.get("/favicon.ico", (req, res) => res.status(204));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
