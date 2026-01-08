import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "./logger.js";

const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      logger.error("ERROR: ROUTE HANDLER: ", error);
      res.status(500).json({
        message: error.message,
      });
    }
  };
};

export default TryCatch;
