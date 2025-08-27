import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userroute.js";
import authRouter from "./routes/authRoute.js";
import listingRouter from "./routes/listingroute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("MongoDB connection error:", err));


const allowedOrigins = [
  "https://mern-estate-frontend-zeta.vercel.app", 
  "http://localhost:5173"                          
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow requests like Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));


app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);


app.get("/api", (req, res) => {
  res.send("API is running");
});

app.get("/favicon.ico", (req, res) => res.status(204));


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


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
