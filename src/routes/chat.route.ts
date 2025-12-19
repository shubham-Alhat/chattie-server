import { Router } from "express";
import { getAllChats } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/get-all-chats").get(authMiddleware, getAllChats);

export default router;
