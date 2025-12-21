import { Router } from "express";
import {
  getAllChats,
  getSelectedChatMessage,
  sendMessage,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/get-all-chats").get(authMiddleware, getAllChats);

router.route("/send-message").post(authMiddleware, sendMessage);

router
  .route("/get-messages/:receiverId")
  .get(authMiddleware, getSelectedChatMessage);

export default router;
