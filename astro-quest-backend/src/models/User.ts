import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  birthDate: String,
  birthTime: String,
  birthPlace: String,
  predictions: [String],
});

export default mongoose.model("User", UserSchema);
