import logger from "./utils/logger.js";
import morganMiddleware from "./middleware/morganMiddleware.js";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

// GLOBAL MIDDLEWARE SETUP
app.use(morganMiddleware);

// ROUTES
app.get("/test/crypto", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api2.binance.com/api/v3/ticker/24hr"
    );
    const tickerPrice = response.data;
    res.json(tickerPrice);
  } catch (err) {
    logger.error(err);
    res.status(500).send("Internal server error");
  }
});

// SERVER LISTENING

app.listen(4000, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    return;
  }
  console.log("Server is running on port 4000");
});
