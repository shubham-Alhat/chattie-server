import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const loginUser = async (req: Request, res: Response) => {
  try {
    const { password, email } = req.body;

    //   check if password or email is not Null
    if (!password || !email) {
      return res
        .status(400)
        .json({ message: "data not found", success: false });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User with this email not found",
        success: false,
      });
    }

    // check password is correct or not
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    // return if password incorrect
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Password incorrect",
        success: false,
      });
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    const secretKey: any = process.env.JWT_SECRET;

    if (!secretKey) {
      throw new Error("JWT_SECRET is not defined");
    }

    // generate token and sent as cookies
    const token = jwt.sign(payload, secretKey, {
      expiresIn: "1d",
    });

    // when cross domains are there
    // secure:true and sameSite:"none" and httpOnly:true
    // it worked

    const options: Object = {
      httpOnly: true, // can't be accessed by JS
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 days
    };

    res.status(200).cookie("accessToken", token, options).json({
      message: "User login successfully",
      data: existingUser,
      success: true,
      redirect: "/chat",
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, avatar } = req.body;
    if (!username || !email || !password || !avatar) {
      return res
        .status(400)
        .json({ message: "User data not found", success: false });
    }

    // check if user already in db
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exist with this email, Please login",
        success: false,
      });
    }

    // hash password before create a new user
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create new entry in db
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashPassword,
        avatar: avatar,
      },
      omit: {
        password: true,
      },
    });

    // if not created user in db, prisma will throw error

    return res.status(201).json({
      message: "User successfully register",
      data: newUser,
      success: true,
      redirect: "/login",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  const user = req.user;
  // throw error if user not found
  if (!user) {
    return res.status(401).json({
      message: "User not found, Please login",
      success: false,
    });
  }

  const options: Object = {
    httpOnly: true, // can't be accessed by JS
    secure: process.env.NODE_ENV !== "development", // only HTTPS in production
  };

  // clear cookies
  return res.status(200).clearCookie("accessToken", options).json({
    message: "User logout successfully",
    success: true,
  });
};

export { loginUser, registerUser, logoutUser };
