import mongoose from "mongoose";
import { env } from './env';

const connectDB = async (): Promise<boolean> => {
  if (!env.MONGO_URI) {
    console.warn("MONGO_URI not found. Running API without MongoDB.");
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      dbName: "SSC",
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Used: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }

    console.warn("Running API without MongoDB. Local JSON login is still available.");
    return false;
  }
};

export default connectDB;
