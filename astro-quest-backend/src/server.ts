import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first

import app from "./app";
import authRoutes from "./auth/auth.routes";

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5050;


app.listen(PORT, () => {
  console.log(`🚀 Astro-Quest backend running on port ${PORT}`);
});
