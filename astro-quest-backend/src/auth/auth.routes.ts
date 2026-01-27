import { Router } from "express";
import {
  sendOtpController,
  verifyOtpController,
  logoutController, // ✅ ADD THIS
} from "./auth.controller";

const router = Router();

router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);
router.post("/logout", logoutController);



export default router;
