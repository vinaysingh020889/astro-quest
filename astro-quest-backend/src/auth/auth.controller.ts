import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import Session from "../session/session.model";
import MongoUser from "../models/User";
import Onboarding from "../models/Onboarding";

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
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

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

    console.log(`🔐 OTP for ${email}: ${otp}`);

    return res.json({
      message: "OTP sent successfully",
      otp, // TEMP (remove in prod)
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
  const { email, otp, tempOnboardingId } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ✅ TYPE-SAFE GUARD (THIS FIXES RED LINES)
    if (
      !user ||
      user.otp === null ||
      user.otpExpiry === null ||
      user.otp !== otp ||
      user.otpExpiry.getTime() < Date.now()
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

    // 🔗 ENSURE MONGODB USER EXISTS
    await MongoUser.findOneAndUpdate(
      { userId: user.id },
      { email: user.email },
      { upsert: true }
    );

    // 🔗 LINK ONBOARDING (IF EXISTS)
    if (tempOnboardingId) {
      await Onboarding.findOneAndUpdate(
        { tempOnboardingId },
        {
          userId: user.id,
          linked: true,
        }
      );
    }

    // 🔐 START SESSION
    const session = await Session.create({
      userId: user.id,
    });

    console.log("🟢 SESSION STARTED:", session._id.toString());

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        sessionId: session._id,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      userId: user.id, // ✅ ADD THIS LINE (VERY IMPORTANT)
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

/**
 * 🔥 GLOBAL LOGOUT — END ALL SESSIONS
 */
export const logoutController = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    await Session.updateMany(
      { userId: decoded.userId, isActive: true },
      {
        isActive: false,
        endedAt: new Date(),
      }
    );

    return res.json({
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};
