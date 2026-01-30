import express from "express";
import isAuth from "../middleware/isAuth.js";
import { createChat, getAllChats, sendMessage } from "../controllers/chat.js";
import { upload } from "../middleware/multer.js";
import { uploadToCloudinary } from "../middleware/cloudinary.js";

const router = express.Router();

router.post("/chat/new", isAuth, createChat);
router.get("/chat/all", isAuth, getAllChats);
router.post(
  "/message",
  isAuth,
  upload.single("image"),
  uploadToCloudinary,
  sendMessage
);

// route for testing cloudinary uploads
// router.post(
//   "/upload",
//   isAuth,
//   upload.single("image"),
//   uploadToCloudinary,
//   uploadImages
// );

export default router;
