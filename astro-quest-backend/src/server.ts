import dotenv from "dotenv";
import connectDB from "./config/db"; // 👈 or correct path

dotenv.config(); // ✅ MUST be first

import app from "./app";
// import authRoutes from "./auth/auth.routes";

// app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5050;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Astro-Quest backend running on port ${PORT}`);
});
