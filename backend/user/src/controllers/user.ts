import { publishToQueue } from "../config/rabbitmqProducer.js";
import TryCatch from "../utils/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/User.js";
import generateToken from "../config/generateToken.js";
import logger from "../utils/logger.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { Response } from "express";
import mongoose from "mongoose";

// LOGIN USER CONTROLLER
export const loginUser = TryCatch(async (req, res) => {
  const email = req.body.email.trim();

  if (!email) {
    res.status(400).json({ message: "Login failed - Please provide email." });
    return;
  }

  // create `rateLimitKey` to check if it already exists in Redis. It will only exist for 60s, thus applying rateLimit of 60s on users.
  const rateLimitKey = `otp:rateLimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    res.status(429).json({
      message: "Too many requests. Please wait before generating OTP.",
    });
    return;
  }

  // If no `rateLimit`, then generate otp, and store it for 5mins in redis.
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpKey = `otp:${email}`;

  // OTP valid for 5 minutes
  await redisClient.set(otpKey, otp, {
    expiration: {
      type: "EX",
      value: 300,
    },
  });

  // set 60 seconds rate limit on generating OTP
  await redisClient.set(rateLimitKey, "true", {
    expiration: {
      type: "EX",
      value: 60,
    },
  });

  // Create a message and publish to `send-otp` queue to send a mail to the provided email.
  const message = {
    to: email,
    subject: "Your 6-digit OTP code",
    body: `Your 6-digit OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  await publishToQueue("send-otp", message);

  res.status(202).json({
    message: "OTP queued for delivery.",
  });
});

// VERIFY USER CONTROLLER
export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp }: { email: string; otp: string } = req.body;
  // Check if email and otp are provided
  if (!email || !otp) {
    res.status(400).json({
      message: "Email and OTP required.",
    });
    return;
  }

  // Check if otp exists in redis and is valid
  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp || storedOtp !== otp) {
    res.status(400).json({
      message: "Invalid or expired OTP.",
    });
    return;
  }

  // Single use OTP : Delete OTP
  await redisClient.del(otpKey);

  // Delete rate limiting key if exists
  const rateLimitKey = `otp:rateLimit:${email}`;
  const storedRateLimitKey = await redisClient.get(rateLimitKey);
  if (storedRateLimitKey) {
    await redisClient.del(rateLimitKey);
  }

  // Check if user exists, if not - create user
  let user = await User.findOne({ email });
  if (!user) {
    const name = email.split("@")[0].slice(0, 8); // temporary default name, can be edited later
    user = await User.create({ name, email });
  }

  // Generate token
  const token = await generateToken(user);

  const resMessage = {
    message: "User successfully verified",
    user,
    token,
  };
  logger.info(resMessage);

  res.json(resMessage);
});

// USER PROFILE CONTROLLER
export const userProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    res.json(user);
  },
);

// UPDATE NAME CONTROLLER
export const updateName = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    // Is user isn't found
    if (!user) {
      res.status(404).json({ message: "Update name - Please login." });
      return;
    }

    const name = req.body.name.trim();

    // If name isn't provided
    if (!name) {
      return res.status(400).json({ message: "Please provide a name." });
    }

    user.name = name;
    await user.save();

    // Generate a new token with updated user
    const token = await generateToken(user);

    res.json({
      message: "Update name - Successfully updated user's name",
      user,
      token,
    });
  },
);

// GET SINGLE USER CONTROLLER
export const getUser = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    // Get id from params at `:id` dynamic endpoint
    const userId = req.params.id;

    // Check if provided id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user id." });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "No user found." });
      return;
    }

    res.json(user);
  },
);

// GET ALL USERS CONTROLLER
export const getAllUsers = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find();

    res.json(users);
  },
);
