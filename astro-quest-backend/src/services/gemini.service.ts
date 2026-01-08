import axios from "axios";

export const generatePrediction = async (prompt: string) => {
  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      params: { key: process.env.GEMINI_API_KEY },
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};
