import amqp from "amqplib";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

let channel: amqp.Channel | null = null;

const RabbitMQ_URL = {
  protocol: "amqp",
  hostname: process.env.RABBITMQ_HOST,
  port: parseInt(process.env.RABBITMQ_PORT as string),
  username: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASSWORD,
};

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RabbitMQ_URL);
    channel = await connection.createChannel();
    logger.info("Connected to RabbitMQ");
  } catch (error) {
    logger.error(error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    logger.error("RabbitMQ channel in not initialised");
    throw new Error("RabbitMQ channel in not initialised");
  }
  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
