/* global process */
import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not found. Running API without MongoDB.");
    return false;
  }

  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        dbName: "SSC",
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Used: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.warn("Running API without MongoDB. Local JSON login is still available.");
    return false;
  }
};

export default connectDB;
