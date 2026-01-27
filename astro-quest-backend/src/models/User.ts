// This is a Mongo mirror of PostgreSQL user
// src/models/User.ts

import mongoose, { Schema, Document } from "mongoose";

export interface MongoUser extends Document {
  userId: string;   // PostgreSQL UUID
  email: string;
  createdAt: Date;
}

const UserSchema = new Schema<MongoUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<MongoUser>("User", UserSchema);
