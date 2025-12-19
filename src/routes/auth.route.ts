import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/signup").post(registerUser);

router.route("/logout").post(authMiddleware, logoutUser);

export default router;
