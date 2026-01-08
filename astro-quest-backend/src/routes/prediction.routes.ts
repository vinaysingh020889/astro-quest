import express from "express";
import User from "../models/User";
import { generatePrediction } from "../services/gemini.service";

const router = express.Router();

router.post("/predict", async (req, res) => {
  const { name, birthDate, birthTime, birthPlace } = req.body;

  const prompt = `
You are a Vedic astrologer.
Born: ${birthDate} ${birthTime} at ${birthPlace}.
Give exactly 2 predictions.
`;

  const text = await generatePrediction(prompt);
  const predictions = text.split("\n").slice(0, 2);

  const user = await User.create({
    name,
    birthDate,
    birthTime,
    birthPlace,
    predictions,
  });

  res.json({ predictions, userId: user._id });
});

export default router;
