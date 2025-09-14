import mongoose from "mongoose";

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MONGODB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
})();
