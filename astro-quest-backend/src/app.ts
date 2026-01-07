import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes";
import Toast from 'react-native-toast-message';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Astro-Quest Backend is running 🚀",
  });
});

export default app;




