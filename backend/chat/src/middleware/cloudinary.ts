import dotenv from "dotenv";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import sharp from "sharp";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger.js";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer;
}

export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Getting files after using multer's `upload` middleware in chain, which puts files in req.files
    const files: CloudinaryFile[] = req.files as CloudinaryFile[];

    // Checking if files aren't provided
    if (!files || files.length === 0) {
      return next(new Error("No files provided."));
    }

    // Processing files
    const cloudinaryUrls: string[] = [];

    for (const file of files) {
      // Resizing files using sharp for improved performance and standard size
      const resizedBuffer: Buffer = await sharp(file.path)
        .resize({
          width: 800,
          height: 600,
        })
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "relaychat-cloudinary-assets",
        } as any,
        (
          err: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (err) {
            logger.error("Cloudinary upload error: ", err);
            return next(`Cloudinary upload error ${err}`);
          }
          if (!result) {
            logger.error(`Cloudinary upload error: Result is undefined`);
            return next(
              new Error(`Cloudinary upload error: Result is undefined`)
            );
          }
          // If no problems, push secure_url to array
          cloudinaryUrls.push(result.secure_url);

          // Check if all files were processed, then pass secure_url's to req.body for further processing
          if (cloudinaryUrls.length === files.length) {
            req.body.cloudinaryUrls = cloudinaryUrls;
            next();
          }
        }
      );
      uploadStream.end(resizedBuffer);
    }
  } catch (error) {
    logger.error(`Error in uploadToCloudinary middleware: `, error);
    next(`Cloudinary upload error: ${error}`);
  }
};
