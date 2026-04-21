import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI, // Atlas base URL WITHOUT DB name
      {
        dbName: "SSC-Pathnimramn",
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Used: ${conn.connection.name}`);
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;