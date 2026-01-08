import { publishToQueue } from "../config/rabbitmqProducer.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";

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

  await publishToQueue("send-otp-2", message);

  res.status(200).json({
    message: "OTP sent to your mail",
  });
});
