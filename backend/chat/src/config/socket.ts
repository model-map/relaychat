import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

interface ISocketTypingData {
  chatId: string;
  userId: string;
}

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [`${process.env.CLIENT_SERVICE}`],
    methods: ["GET", "POST"],
  },
});

const userSocketMap: Record<string, string> = {};

io.on("connection", (socket: Socket) => {
  logger.info(`Socket.io - User Connected. socketId:${socket.id}`);

  //   Getting user Id
  const userId = socket.handshake.query.userId as string;
  if (userId && userId !== undefined) {
    userSocketMap[userId] = socket.id;
    logger.info(`Socket.io - User:${userId} mapped to socketId:${socket.id}`);
  }

  io.emit("getOnlineUser", Object.keys(userSocketMap));

  //   Join a room using userId to specifically broadcast later
  if (userId) {
    socket.join(userId);
  }
  //   Listen to `typing` event from all clients. Client will send chatId and userId of the user they're typing in. Use this to emit a `typing` event to that particular user
  socket.on("typing", (data: ISocketTypingData) => {
    const chatId = data.chatId;
    const userId = data.userId;
    logger.info(`USER: ${userId} is typing in CHAT: ${chatId}`);
    io.to(userId).emit("typing", { chatId, userId });
  });

  //   Listen to `stoppedTyping` event from all clients. Client will send chatId and userId of the user they've stopped typing in. Use this to emit a `stoppedTyping` event to that particular user
  socket.on("stoppedTyping", (data: ISocketTypingData) => {
    const chatId = data.chatId;
    const userId = data.userId;
    logger.info(`USER: ${userId} has stopped typing in CHAT: ${chatId}`);
    io.to(userId).emit("stoppedTyping", { chatId, userId });
  });

  // On socket disconnect
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      logger.info(
        `Socket.io - User:${userId} removed from socketId:${socket.id}`,
      );
      io.emit("getOnlineUser", Object.keys(userSocketMap));
    }
    logger.info(`Socket.io - User disconnected. socketId:${socket.id}`);
  });

  // On socket connection error
  socket.on("connect_error", (error) => {
    logger.error(`Socket.io - Connection error. error: ${error}`);
  });
});

export { app, server, io };
