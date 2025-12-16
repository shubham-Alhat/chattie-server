import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import bcrypt from "bcrypt";

const loginUser = async (req: Request, res: Response) => {
  try {
    const { password, email } = req.body;

    //   check if password or username is not Null
    if (!password || !email) {
      return res
        .status(404)
        .json({ message: "data not found", success: false });
    }

    //   check if user in db or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    //   if user is there, check password
    if (existingUser) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordCorrect) {
        return res
          .status(401)
          .json({ message: "email or password incorrect", success: false });
      } else {
        res.cookie;
      }
    }

    res.status(200).json({ message: "login success" });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser };
