import Chat from "./chat.model";
import Onboarding from "../models/Onboarding";
// import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import crypto from "crypto";
import { generatePrediction } from "../services/gemini.service";
import { Request } from "express";



/**
 * SAVE CHAT
 * - Frontend sends { message, sessionId? }
 * - Backend handles onboarding + AI context
 */
export const saveChat = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const userId = req.user!.userId;

    // ✅ Ensure sessionId (non-breaking)
    const activeSessionId: string = sessionId || crypto.randomUUID();

    // 🔍 Fetch onboarding once (silent)
    const onboarding = await Onboarding.findOne({ userId });

    // 🧠 System prompt (safe + invisible to user)
    let systemPrompt = `
You are a wise Vedic astrologer.
Speak clearly, respectfully, and confidently.
Do not ask for birth details again.
`;

    if (onboarding) {
      systemPrompt += `
User Details:
Name: ${onboarding.fullName}
Birth Date: ${onboarding.birthDate}
Birth Time: ${onboarding.birthTime}
Birth Place: ${onboarding.birthPlace}
`;
    }

    // 1️⃣ Save USER message
    const userChat = await Chat.create({
      userId,
      sessionId: activeSessionId,
      role: "user",
      message,
    });

    // 2️⃣ Generate AI reply
    const assistantText = await generatePrediction(
      `${systemPrompt}\nUser Question: ${message}`
    );

    // 3️⃣ Save ASSISTANT message
    const assistantChat = await Chat.create({
      userId,
      sessionId: activeSessionId,
      role: "assistant",
      message: assistantText,
      model: "gemini-2.5-flash",
    });

    // 4️⃣ Return response (unchanged structure + sessionId)
    res.status(201).json({
      sessionId: activeSessionId,
      userChat,
      assistantChat,
    });
  } catch (error) {
    console.error("🔥 CHAT SAVE ERROR FULL:", error);
    res.status(500).json({ message: "Failed to save chat" });
  }
};

/**
 * GET CHAT HISTORY (current user)
 */
export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({
      userId: req.user!.userId,
    })
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(chats);
  } catch (error) {
    console.error("Chat fetch error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
};
