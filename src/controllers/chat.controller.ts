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

const sendMessage = async (req: Request, res: Response) => {
  try {
    // access user by middleware
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found", success: false });
    }

    // get message content and receiverId from req.body
    const { textMessage, receiverId } = req.body;

    if (!textMessage || !receiverId) {
      return res
        .status(400)
        .json({ message: "Message | receiverId not found!!", success: false });
    }

    // create entry in db
    const sentMessage = await prisma.message.create({
      data: {
        textContent: textMessage,
        isRead: false,
        senderId: user.id,
        receiverId: receiverId,
      },
      include: {
        sender: {
          omit: {
            password: true,
          },
        },
        receiver: {
          omit: {
            password: true,
          },
        },
      },
    });

    if (!sentMessage) {
      return res
        .status(500)
        .json({ message: "Message not created in db", success: false });
    }

    // success response
    return res.status(201).json({
      message: "Message created successfully",
      success: true,
      data: sentMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while sending message",
      success: false,
    });
  }
};

const getSelectedChatMessage = async (req: Request, res: Response) => {
  try {
    // access user by middleware
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found", success: false });
    }

    // get receiverId from req.body
    const { receiverId } = req.params;

    if (!receiverId || receiverId === user.id) {
      return res
        .status(400)
        .json({ message: "Invalid ReceiverId found!!", success: false });
    }

    const allMessages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: user.id,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: user.id,
          },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      message: "Fetched messages successfully",
      success: true,
      data: allMessages,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error in fetching messages", success: false });
  }
};

export { getAllChats, sendMessage, getSelectedChatMessage };
