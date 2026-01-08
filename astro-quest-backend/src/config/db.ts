import mongoose from "mongoose";
// remove this line later
// console.log("Mongo URI:", process.env.MONGO_URI?.slice(0, 25));


export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB error", err);
    process.exit(1);
  }
};
export default connectDB