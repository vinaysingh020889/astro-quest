import express from "express";
import chatRoutes from "./chat/chat.routes";

const app = express();

// 🔥 THIS LINE WAS MISSING OR MOVED
app.use(express.json());

// (optional but safe)
app.use(express.urlencoded({ extended: true }));

// routes AFTER this
app.use("/api/chat", chatRoutes);

export default app;

