import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

/* 🔹 OTP generator */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * SEND OTP
 */
export const sendOtpController = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // ⏱️ 5 minutes

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          otp,
          otpExpiry: expiry,
        },
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          otp,
          otpExpiry: expiry,
        },
      });
    }

    // 📩 TEMP: log OTP (later replace with email/SMS)
    console.log(`🔐 OTP for ${email}: ${otp}`);

    return res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * VERIFY OTP
 */
export const verifyOtpController = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // ✅ Clear OTP after verification
    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
};
