import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

// cors stuff
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "hello from server" });
});

app.use("/api/v1/auth", authRouter);

app.get("/api/v1/checkme", authMiddleware, (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json({ message: "checkme success", data: user, success: true });
});

export default app;
