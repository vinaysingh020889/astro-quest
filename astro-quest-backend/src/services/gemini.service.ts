// src/services/gemini.service.ts

import axios from "axios";

export const generatePrediction = async (prompt: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing in backend env");
  }

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    return text;
  } catch (error: any) {
    console.error(
      "❌ Gemini backend error:",
      error.response?.data || error.message
    );
    throw new Error("Gemini generation failed");
  }
};
