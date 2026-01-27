import { Router } from "express";
import { saveChat, getChats } from "./chat.controller";
import {
  getChatSessions,
  getSessionChats,
} from "./chat.history.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();


router.post("/", authMiddleware, saveChat);
router.get("/", authMiddleware, getChats);

// 🆕 new routes for chat history / sidebar
router.get("/sessions", authMiddleware, getChatSessions);
router.get("/sessions/:sessionId", authMiddleware, getSessionChats);

export default router;
