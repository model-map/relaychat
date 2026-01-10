import express from "express";
import {
  getAllUsers,
  getUser,
  loginUser,
  updateName,
  userProfile,
  verifyUser,
} from "../controllers/user.js";
import isAuth from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, userProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", getUser);
router.put("/update/user", isAuth, updateName);

export default router;
