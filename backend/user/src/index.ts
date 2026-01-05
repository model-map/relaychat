import logger from "./utils/logger.js";
import morganMiddleware from "./middleware/morganMiddleware.js";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";

dotenv.config();
const app = express();

// GLOBAL MIDDLEWARE SETUP
app.use(morganMiddleware);

connectDb();

// REDIS SETUP

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT!),
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect().then(() => console.log(`Connected to Redis.`));

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
    console.error("Failed to start server:", err);
    return;
  }
  console.log("Server is running on port 4000");
});
