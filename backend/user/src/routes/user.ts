import express from "express";
import { loginUser, userProfile, verifyUser } from "../controllers/user.js";
import isAuth from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, userProfile);

export default router;
