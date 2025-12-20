import { Router } from "express";
import { getAllChats, sendMessage } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/get-all-chats").get(authMiddleware, getAllChats);

router.route("/send-message").post(authMiddleware, sendMessage);

export default router;
