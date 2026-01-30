import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../utils/TryCatch.js";
import { Chat } from "../models/Chat.js";
import { IMessage, Messages } from "../models/Messages.js";
import axios from "axios";
import logger from "../utils/logger.js";

// ----------------------------------------------------------
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

// ----------------------------------------------------------
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

    // // Check if userId string is Valid ObjectId, if yes, convert it to ObjectId
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   res.status(400).send({
    //     message:
    //       "Failed to fetch chats - userId is not valid mongoose ObjectId - Please provide valid userId.",
    //   });
    //   return;
    // }
    // userId = new mongoose.Types.ObjectId(userId);

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
          //axios fetches data in .data property that has to be awaited.
          const { data } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
          );

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

// ----------------------------------------------------------
// CONTROLLER TO SEND A MESSAGE
export const sendMessage = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    // Current user would be the sender, we need to get their id, chatId, and the text and/or image they're trying to send
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;

    // if no senderId found
    if (!senderId) {
      logger.http({
        message: "Failed to send message - senderId not found - please login.",
      });
      return res.status(401).json({
        message: "Failed to send message - senderId not found - please login.",
      });
    }

    // If no chatId found
    if (!chatId) {
      logger.http({
        message: "Failed to send message - ChatId required.",
      });
      return res
        .status(400)
        .json({ message: "Failed to send message - ChatId required." });
    }

    // If neither image or text is provided
    if (!text && !imageFile) {
      logger.http({
        message: "Failed to send message - Either text or image required.",
      });
      return res.status(400).json({
        message: "Failed to send message - Either text or image required.",
      });
    }

    // Get chat with corresponding chatId
    const chat = await Chat.findById(chatId);

    if (!chat) {
      logger.http({
        message: "Failed to send message - Invalid ChatId.",
      });
      return res
        .status(400)
        .json({ message: "Failed to send message - Invalid ChatId." });
    }

    // Check if user is in chat
    const isUserInChat = chat.users.some(
      (userId) => userId.equals(senderId) //using .equals for mongoose objectIds
    );

    if (!isUserInChat) {
      logger.http({
        message:
          "Failed to send message - You are not a participant of this chat",
      });
      return res.status(403).json({
        message:
          "Failed to send message - You are not a participant of this chat",
      });
    }

    // Getting other user's id
    const otherUserId = chat.users.find((userId) => !userId.equals(senderId));

    // if no other user found
    if (!otherUserId) {
      logger.http({
        message: "Failed to send message - otherUserId not found",
      });
      return res.status(401).json({
        message: "Failed to send message - otherUserId not found",
      });
    }

    // If all else good, popualte messageData and create a message
    const messageData: IMessage = {
      chatId,
      sender: senderId,
      seen: false,
      messageType: "text",
    };
    // Setting imageFile data if it exists
    if (imageFile) {
      messageData.image = {
        url: req.body.cloudinaryUrl, // populated using the `uploadToCloudinary middleware`
        publicId: imageFile.filename,
      };
      messageData.messageType = "image";
      messageData.text = text || "";
    } else {
      messageData.text = text;
    }

    const message = new Messages(messageData);
    const savedMessage = await message.save();

    const latestMessageText = imageFile ? `📷 Image` : text;

    await Chat.findByIdAndUpdate(
      chatId,
      {
        latestMessage: {
          text: latestMessageText,
          sender: senderId,
        },
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );

    // Emit to socket

    res.status(201).json({
      message: savedMessage,
      sender: senderId,
    });
  }
);

// ----------------------------------------------------------
// CONTROLLER FOR TESTING CLOUDINARY UPLOADS
// export const uploadImages = TryCatch(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const cloudinaryUrl = req.body.cloudinaryUrl;
//     if (!cloudinaryUrl) {
//       logger.error(`No Cloudinary URLs found`);
//       return res.status(500).json({
//         message: "Failed to upload images.",
//       });
//     }
//     const image = cloudinaryUrl;
//     return res.json({ image });
//   }
// );
