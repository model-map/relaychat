import amqp from "amqplib";
import logger from "../utils/logger.js";

let channel: amqp.Channel | null = null;

const RabbitMQ_URL = {
  protocol: "amqp",
  hostname: process.env.RABBITMQ_HOST,
  port: parseInt(process.env.RABBITMQ_PORT!),
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
    logger.info("RabbitMQ channel in not initialised");
    return;
  }
  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
