
import express from "express";
import chatRoutes from "./chat/chat.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import authRoutes from "./auth/auth.routes"; // ✅ FIXED PATH

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api", onboardingRoutes);
app.use("/api/auth", authRoutes); // 🔥 THIS FIXES EVERYTHING

export default app;






