import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB CONNECTED");
    console.log("➡️ HOST:", mongoose.connection.host);
    console.log("➡️ DB NAME:", mongoose.connection.name);
    console.log("➡️ READY STATE:", mongoose.connection.readyState);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;

