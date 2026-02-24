import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

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
