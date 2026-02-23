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
  logger.info(`User Connected: ${socket.id}`);

  // On socket disconnect
  socket.on("disconnect", () => {
    logger.info(`User Disconnected: ${socket.id}`);
  });

  // On socket connection error
  socket.on("connect_error", (error) => {
    logger.error(`Socket connection error: ${error}`);
  });
});

export { app, server, io };
