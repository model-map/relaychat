import logger from "./utils/logger.js";
import morganMiddleware from "./middleware/morganMiddleware.js";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "redis";
import { startSendOtpConsumer } from "./config/rabbitmqConsumer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Start RabbitMQ Consumer
startSendOtpConsumer();

// setup public assets
app.use(express.static(path.join(__dirname, "public")));

// Global middleware for logging HTTP requests
app.use(morganMiddleware);

// Redis setup
const client = createClient({
  username: process.env.REDIS_USERNAME, // from .env
  password: process.env.REDIS_PASSWORD, // from .env
  socket: {
    keepAlive: true, // sends TCP keep-alive packets to prevent connection drops
    host: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT!),
    reconnectStrategy(retries, cause) {
      // Retry connecting up to 10 times with exponential backoff
      if (retries > 10) return new Error("Retry limit reached." + " " + cause);
      return Math.min(retries * 100, 3000); // wait time in ms
    },
  },
});

// Optional: Ping Redis every 10 seconds to ensure connection stays alive
setInterval(async () => {
  try {
    const res = await client.ping(); // sends PING command
  } catch (error) {
    logger.error(error); // log if ping fails
  }
}, 10000);

// Listen for client errors
client.on("error", (err) => {
  logger.error(err);
});

// Connect to Redis server
await client.connect().then(() => logger.info("Connected to Redis."));

// Example route
app.get("/test/crypto", async (req, res) => {
  try {
    const response = await fetch("https://api2.binance.com/api/v3/ticker/24hr");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).send("Internal server error");
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, (err) => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.info(`Server is running on: http://localhost:${PORT}`);
});
