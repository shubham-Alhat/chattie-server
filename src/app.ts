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

// new map for storing connections
const activeConnections = new Map();

wss.on("connection", (ws) => {
  console.log("🟢 Client connected to ws server");

  let userId: string | null = null;

  // listen for user_connected event
  ws.on("message", (rawData) => {
    // rawData IS the actual message data (Buffer/string) sent from frontend
    // convert raw data to json
    // always use try-catch because client can send invalid json??
    try {
      const data = JSON.parse(rawData.toString());

      // now check type of events
      if (data.type === "user_connected") {
        userId = data.userId;

        // Handle reconnection: if user already has a connection, close the old one
        // eg: If a user opens a new tab, close the old connection and reconnect new ws
        const existingConnection = activeConnections.get(userId);
        if (existingConnection && existingConnection !== ws) {
          existingConnection.close();
        }

        // store connections
        activeConnections.set(userId, ws); // while setting up this, we use key as userId and value as ws. (key=userId and value=ws)
        // but when we do forEach(); see below

        // map.forEach((value, key) => {
        //   value = the VALUE stored in the map
        //   key = the KEY you used to store it
        // });

        // broadcast to all
        activeConnections.forEach((otherWs, otherUserId) => {
          if (otherUserId !== userId && otherWs.readyState === 1) {
            otherWs.send(
              JSON.stringify({ type: "user_online", userId: userId })
            );
          }
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("🔴 Connection closed..");
    if (userId) {
      activeConnections.delete(userId);
    }

    // broadcast to all
    activeConnections.forEach((otherWs, otherUserId) => {
      if (otherWs.readyState === 1) {
        otherWs.send(JSON.stringify({ type: "user_offline", userId }));
      }
    });
  });
});

export default server;
