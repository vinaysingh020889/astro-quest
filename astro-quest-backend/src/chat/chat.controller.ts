import Chat from "./chat.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";



export const saveChat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, role } = req.body;

    const chat = await Chat.create({
      userId: req.user!.userId, // ✅ FIXED
      role,
      message,
    });

    res.status(201).json(chat);
} catch (error) {
  console.error("🔥 CHAT SAVE ERROR FULL:", error);
  res.status(500).json({ message: "Failed to save chat", error });
}
};

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({ userId: req.user!.userId }) // ✅ FIXED
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(chats);
  } catch (error) {
    console.error("Chat fetch error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
};
