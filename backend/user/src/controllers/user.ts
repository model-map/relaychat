import { publishToQueue } from "../config/rabbitmqProducer.js";
import TryCatch from "../utils/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/User.js";
import generateToken from "../config/generateToken.js";
import logger from "../utils/logger.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;
  const rateLimitKey = `otp:rateLimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    res.status(429).json({
      message: "Too many requests. Please wait before generating OTP.",
    });
    return;
  }

  const otp = Math.floor(10000 + Math.random() * 90000);
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

  const message = {
    to: email,
    subject: "Your 6-digit OTP code",
    body: `Your 6-digit OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  await publishToQueue("send-otp", message);

  res.status(200).json({
    message: "OTP sent to your mail",
  });
});

// verify user
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

  // Single use OTP
  await redisClient.del(otpKey);

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
