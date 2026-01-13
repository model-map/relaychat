import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../utils/TryCatch.js";
import { Chat } from "../models/Chat.js";

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
