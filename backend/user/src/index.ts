import logger from "./utils/logger.js";
import morganMiddleware from "./middleware/morganMiddleware.js";
import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRouter from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmqProducer.js";
import { fileURLToPath } from "url";
import path from "path";
import TryCatch from "./config/TryCatch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// express global middlewares for body parsing and static files assets
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GLOBAL MIDDLEWARE SETUP
app.use(morganMiddleware);

connectDb();
connectRabbitMQ();

// REDIS SETUP

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

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
  logger.error(err);
});
await redisClient.connect().then(() => logger.info(`Connected to Redis.`));

export { redisClient };

const service = "user";
// ROUTES
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
app.use("/api/v1", userRouter);

// SERVER LISTENING

app.listen(4000, (err) => {
  if (err) {
    logger.error("Failed to start server:", err);
    return;
  }
  redisClient.set(
    `${service}-service-startTime`,
    new Date(Date.now()).toISOString()
  );
  logger.info("Server is running on port 4000");
});
