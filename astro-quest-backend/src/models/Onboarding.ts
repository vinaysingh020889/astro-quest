// Move birth & kundli data here
// src/models/Onboarding.ts

import mongoose, { Schema, Document } from "mongoose";

export interface Onboarding extends Document {
  tempOnboardingId: string;
  userId?: string;              // added after login
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  linked: boolean;
  createdAt: Date;
}

const OnboardingSchema = new Schema<Onboarding>({
  tempOnboardingId: {
    type: String,
    required: true,
    unique: true,
  },

  userId: {
    type: String, // PostgreSQL UUID
    index: true,
  },

  fullName: { type: String, required: true },
  birthDate: { type: String, required: true }, // YYYY-MM-DD
  birthTime: { type: String, required: true }, // HH:mm
  birthPlace: { type: String, required: true },

  linked: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Onboarding>("Onboarding", OnboardingSchema);
