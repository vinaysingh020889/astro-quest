import { Router } from "express";
import { saveChat, getChats } from "./chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, saveChat);
router.get("/", authMiddleware, getChats);

export default router;
