import amqp from "amqplib";
import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const RabbitMQ_URL = {
  protocol: "amqp",
  hostname: process.env.RABBITMQ_HOST,
  port: parseInt(process.env.RABBITMQ_PORT!),
  username: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASSWORD,
};

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect(RabbitMQ_URL);
    const channel = await connection.createChannel();

    const queueName = "send-otp";

    await channel.assertQueue(queueName, { durable: true });

    logger.info(
      "RabbitMQ: mail-service consumer started. Listening for OTP emails."
    );

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          if (!to) {
            logger.error(`"to" field not defined.`);
          }
          const transporter: Transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: process.env.MAILER_USER,
              pass: process.env.MAILER_PASSWORD,
            },
          });
          await transporter.sendMail({
            from: "Relay Chat",
            to,
            subject,
            text: body,
          });

          logger.info(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          logger.error("Failed to send OTP: ", error);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    logger.error(`Failed to start rabbitMQ consumer: ${error}`);
  }
};
