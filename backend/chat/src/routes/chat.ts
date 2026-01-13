import express from "express";
import TryCatch from "../utils/TryCatch.js";
import isAuth from "../middleware/isAuth.js";
import { createChat } from "../controllers/chat.js";

const router = express.Router();

router.post("/chat/new", isAuth, createChat);

export default router;
