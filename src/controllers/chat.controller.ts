import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";

const getAllChats = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // get all users except authUser
    const allUsers = await prisma.user.findMany({
      where: {
        id: {
          not: user.id,
        },
      },
      omit: {
        password: true,
      },
    });

    if (!allUsers) {
      return res
        .status(404)
        .json({ message: "Others chats not found", success: false });
    }

    return res.status(200).json({
      message: "all users except authUser",
      success: true,
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while fetching all chats", success: false });
  }
};

export { getAllChats };
