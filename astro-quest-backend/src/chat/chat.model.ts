import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // fast user queries
    },

    sessionId: {
      type: String,
      required: true,
      index: true, // group chats by session
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

export default mongoose.models.Chat ||
  mongoose.model("Chat", ChatSchema);

