import logger from "./utils/logger.js";
import morganMiddleware from "./middleware/morganMiddleware.js";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRouter from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmqProducer.js";

dotenv.config();
const app = express();

// GLOBAL MIDDLEWARE SETUP
app.use(morganMiddleware);

connectDb();
connectRabbitMQ();

// REDIS SETUP

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    keepAlive: true,
    host: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT!),
    reconnectStrategy(retries, cause) {
      if (retries > 10) return new Error("Retry limit reached.");
      return Math.min(retries * 100, 3000);
    },
  },
});

// sending a ping to redis every 10 seconds to keep it alive
setInterval(async () => {
  try {
    const res = await client.ping();
  } catch (error) {
    logger.error(error);
  }
}, 10000);

client.on("error", (err) => {
  console.log("Redis Client Error", err);
  logger.error(err);
});
await client.connect().then(() => logger.info(`Connected to Redis.`));

// ROUTES
app.use("api/v1", userRouter);

// app.get("/test/crypto", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://api2.binance.com/api/v3/ticker/24hr"
//     );
//     const tickerPrice = response.data;
//     res.json(tickerPrice);
//   } catch (err) {
//     logger.error(err);
//     res.status(500).send("Internal server error");
//   }
// });

// SERVER LISTENING

app.listen(4000, (err) => {
  if (err) {
    logger.error("Failed to start server:", err);
    return;
  }
  logger.info("Server is running on port 4000");
});
