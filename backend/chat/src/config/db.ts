import mongoose from "mongoose";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  try {
    const url = process.env.MONGO_URI;
    if (!url) {
      throw new Error("MongoDB URI not provided.");
    }
    await mongoose.connect(url, {
      dbName: "relayChatMicroserviceApp",
    });
    logger.info(`Connected to MongoDB`);
  } catch (error: any) {
    logger.error(`Error while connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDb;
