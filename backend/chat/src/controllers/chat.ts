import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../utils/TryCatch.js";
import { Chat } from "../models/Chat.js";
import mongoose from "mongoose";
import { Messages } from "../models/Messages.js";
import axios from "axios";
import logger from "../utils/logger.js";

export const createChat = TryCatch(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Getting current user and other user id
    const userId = req.user?._id;
    const otherUserId = req.body?.id;

    // if no other user id
    if (!otherUserId) {
      res.status(400).json({
        message: "Failed to create chat - Other user ID not provided",
      });
      return;
    }

    // Handle existing chat
    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },
    });
    if (existingChat) {
      res.json({ message: "Chat already exists", chatId: existingChat._id });
      return;
    }

    // Create new chat
    const newChat = await Chat.create({ users: [userId, otherUserId] });
    res.status(201).json({ message: "New Chat created", chatId: newChat._id });
  }
);

// CONTROLLER TO GET ALL CHATS OF A USER
export const getAllChats = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    // Getting userId from request
    let userId = req.user?._id;
    if (!userId) {
      res.status(400).send({
        message: "Failed to fetch chats - No user in request - Please login.",
      });
      return;
    }

    // Check if userId string is Valid ObjectId, if yes, convert it to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).send({
        message:
          "Failed to fetch chats - userId is not valid mongoose ObjectId - Please provide valid userId.",
      });
      return;
    }
    userId = new mongoose.Types.ObjectId(userId);

    // Fetch all chats containing userId
    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

    // chat with user Data
    const chatWithUserData = await Promise.all(
      chats.map(async (chat) => {
        const chatId = chat._id;

        // Getting other user's Id and using it to fetch their data from user-microservice
        const otherUserId = chat.users.find((c) => !c.equals(userId)); //using .equals method to compare ObjectIds

        // Getting unseen messages count
        const unseenCount = await Messages.countDocuments({
          chatId: chatId,
          sender: { $ne: userId },
          seen: false,
        });

        try {
          const { data } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
          ); //axios fetches data in .data property that has to be awaited.
          return {
            user: data,
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        } catch (error) {
          logger.error(error);
          return {
            user: { _id: otherUserId, name: "Unknown user" },
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        }
      })
    );

    res.json({ chats: chatWithUserData });
  }
);

// Uploading images
export const uploadImages = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const cloudinaryUrls = req.body.cloudinaryUrls;
    if (!cloudinaryUrls || cloudinaryUrls.length === 0) {
      logger.error(`No Cloudinary URLs found`);
      return res.status(500).json({
        message: "Failed to upload images.",
      });
    }
    const images = cloudinaryUrls;
    return res.json({ images });
  }
);
