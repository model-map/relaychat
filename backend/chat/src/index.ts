import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import morganMiddleware from "./middleware/morganMiddleware.js";
import logger from "./utils/logger.js";
import { createClient } from "redis";
import TryCatch from "./utils/TryCatch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// express global middlewares for body parsing and static files assets
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Global middleware for logging HTTP requests
app.use(morganMiddleware);

// Redis setup
const redisClient = createClient({
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
    const res = await redisClient.ping();
  } catch (error) {
    logger.error(error);
  }
}, 10000);

redisClient.on("error", (err: any) => {
  console.log("Redis Client Error", err);
  logger.error(err);
});
await redisClient.connect().then(() => logger.info(`Connected to Redis.`));

export { redisClient };

// ROUTES
const service = "chat";
app.get(
  "/",
  TryCatch(async (req, res) => {
    // Current server start time
    const time =
      (await redisClient.get(`${service}-service-startTime`)) ||
      new Date(Date.now()).toISOString();

    const uptime = Math.floor((Date.now() - Date.parse(time)) / 1000);
    // response
    res.status(200).json({
      message: `${service} service running.`,
      Started: `${time}`,
      uptime: `${uptime} seconds`, //uptime in seconds
    });
  })
);

// Start server config
const PORT = Number(process.env.PORT) || 6000;
app.listen(PORT, (err) => {
  if (err) {
    logger.error("Failed to start server:", err);
    return;
  }
  redisClient.set(
    `${service}-service-startTime`,
    new Date(Date.now()).toISOString()
  );
  logger.info(`Server is running on: http://localhost:${PORT}`);
});
