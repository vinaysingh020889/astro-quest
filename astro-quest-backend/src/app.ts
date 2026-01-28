
import express from "express";
import chatRoutes from "./chat/chat.routes";
import onboardingRoutes from "./routes/onboarding.routes";



const app = express();

// 👇 ADD HEALTH CHECK HERE (TOP LEVEL)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api", onboardingRoutes);



export default app;





