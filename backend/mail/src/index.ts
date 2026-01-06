import logger from "./utils/logger.js";
import morganMiddleware from "./middleware/morganMiddleware.js";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// setup public assets
app.use(express.static(path.join(__dirname, "public")));

// Global middleware for logging HTTP requests
app.use(morganMiddleware);

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

app.listen(4001, (err) => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.info("Server is running on: http://localhost:4001");
});
