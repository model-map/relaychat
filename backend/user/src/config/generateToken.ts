import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const generateToken = async (user) => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  try {
    const token = jwt.sign({ user }, JWT_SECRET, {
      expiresIn: "15d",
    });
    return token;
  } catch (error) {
    logger.error(error);
  }
};

export default generateToken;
