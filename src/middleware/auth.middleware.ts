import { prisma } from "../db/prisma.js";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

type decodedTokenState = {
  id: string;
  email: string;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized Request",
        success: false,
        redirect: "/login",
      });
    }

    const secretKey: any = process.env.JWT_SECRET;

    // jwt throw error here if not matched
    const decodedToken = jwt.verify(token, secretKey) as decodedTokenState;

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken?.id,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in db", success: false });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "error in middleware",
      success: false,
      redirect: "/login",
    });
  }
};
