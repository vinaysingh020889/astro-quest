import Chat from "./chat.model";
// import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { Request } from "express";


/**
 * GET CHAT SESSIONS (for sidebar)
 * - One row per session
 * - Shows last message + time
 */
export const getChatSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const sessions = await Chat.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$sessionId",
          lastMessage: { $first: "$message" },
          lastRole: { $first: "$role" },
          lastTime: { $first: "$createdAt" },
        },
      },
      { $sort: { lastTime: -1 } },
      { $limit: 20 },
    ]);

    res.json(
      sessions.map((s) => ({
        sessionId: s._id,
        lastMessage: s.lastMessage,
        lastRole: s.lastRole,
        lastTime: s.lastTime,
      }))
    );
  } catch (error) {
    console.error("Session list error:", error);
    res.status(500).json({ message: "Failed to load chat sessions" });
  }
};

/**
 * GET MESSAGES OF ONE SESSION
 */
export const getSessionChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { sessionId } = req.params;

    const chats = await Chat.find({
      userId,
      sessionId,
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (error) {
    console.error("Session chats error:", error);
    res.status(500).json({ message: "Failed to load session chats" });
  }
};
