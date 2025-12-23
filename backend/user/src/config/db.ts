import mongoose, { mongo } from "mongoose";
import logger from "../utils/logger.js";

const connectDb = async () => {
  const url = process.env.MONGO_URI;

  if (!url) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(url, {
      dbName: "relayChatMicroserviceApp",
    });
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

export default connectDb;
