// src/routes/onboarding.routes.ts

import express from "express";
import crypto from "crypto";
import Onboarding from "../models/Onboarding";
import { generatePrediction } from "../services/gemini.service";


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


/**
 * ONBOARDING CHAT (Gemini via backend)
 */
router.post("/onboarding/chat", async (req, res) => {
  try {
    const { message, time, location } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
You are a highly respected Indian Vedic astrologer, deeply skilled in Prashna Kundali.
Respond in 1–2 sentences only. Be calm, spiritual, precise, and confident.

Question: ${message}
Time of asking: ${time || "Unknown"}
Location: ${location || "Unknown"}
    `;

    const reply = await generatePrediction(prompt);

    res.json({ reply });
  } catch (err) {
    console.error("Onboarding chat error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
