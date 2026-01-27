// src/routes/onboarding.routes.ts

import express from "express";
import crypto from "crypto";
import Onboarding from "../models/Onboarding";

const router = express.Router();

/**
 * ONBOARDING (Before Login)
 * Stores birth details once and returns tempOnboardingId
 */
router.post("/onboarding", async (req, res) => {
  try {
    const { fullName, birthDate, birthTime, birthPlace } = req.body;

    if (!fullName || !birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const tempOnboardingId = crypto.randomUUID();
    console.log("🧠 ONBOARDING API HIT FROM APP"); 


    await Onboarding.create({
      tempOnboardingId,
      fullName,
      birthDate,
      birthTime,
      birthPlace,
    });

    res.json({
      success: true,
      tempOnboardingId,
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ error: "Onboarding failed" });
  }
});

export default router;
