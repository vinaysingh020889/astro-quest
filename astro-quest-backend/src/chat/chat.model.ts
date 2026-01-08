import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // IMPORTANT for fast queries
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: "gemini-2.5-flash",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
