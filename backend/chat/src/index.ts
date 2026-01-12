import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import morganMiddleware from "./middleware/morganMiddleware.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.get("/", (req, res) => res.send("Hello"));

// express global middlewares for body parsing and static files assets
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Global middleware for logging HTTP requests
app.use(morganMiddleware);

const PORT = Number(process.env.PORT) || 6001;
app.listen(PORT, (err) => {
  if (err) {
    logger.error("Failed to start server:", err);
    return;
  }
  logger.info(`Server is running on: http://localhost:${PORT}`);
});
