import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import http from "http";
import { WebSocketServer } from "ws";

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
  return res.status(200).json({ message: "hello from server" });
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/chats", chatRouter);

app.get("/api/v1/checkme", authMiddleware, (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json({ message: "checkme success", data: user, success: true });
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("client connected to ws server");

  ws.on("message", (data) => {
    console.log(data.toString());
  });

  ws.on("close", () => {
    console.log("connection closed..");
  });
});

export default server;
