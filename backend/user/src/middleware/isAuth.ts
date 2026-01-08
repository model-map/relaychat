import { NextFunction, Request, Response } from "express";
import { IUser } from "../model/User.js";
import logger from "../utils/logger.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Getting auth header from req.headers
    const authHeader = req.headers.authorization;

    // If no auth header or it doesn't contain Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Please login - no auth header" });
      return;
    }
    const token = authHeader.split(" ")[1];
    // decode token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // check if decoded token exists and contains user
    if (!decodedToken || !decodedToken.user) {
      res.status(401).json({ message: "Invalid JWT token" });
      return;
    }

    // If all else is good, then set req.user as the user in token, and call next() fn
    req.user = decodedToken.user;
    next();
  } catch (error) {
    logger.error("");
    res.status(401).json({ message: "Please login - JWT error" });
  }
};
