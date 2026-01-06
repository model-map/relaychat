import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, json, errors } = winston.format;
const LOG_DIR = path.resolve("logs");

const errorFilter = winston.format((info) =>
  info.level === "error" ? info : false
)();
const infoFilter = winston.format((info) =>
  info.level === "info" ? info : false
)();

const rotate = ({ filename, format }) => {
  return new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename,
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    format,
  });
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(errors({ stack: true }), timestamp(), json()),
  defaultMeta: { service: "user-service" },
  transports: [
    rotate({
      filename: "combined-%DATE%.log",
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
    rotate({
      filename: "app-%DATE%-error.log",
      level: "error",
      format: combine(
        errors({ stack: true }),
        errorFilter,
        timestamp(),
        json()
      ),
    }),
    rotate({
      filename: "app-%DATE%-info.log",
      level: "info",
      format: combine(infoFilter, timestamp(), json()),
    }),
    new winston.transports.Console({
      level: "http",
      format: combine(timestamp(), json()),
    }),
  ],
  exceptionHandlers: [
    rotate({
      filename: "app-%DATE%-exceptions.log",
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
  ],
  rejectionHandlers: [
    rotate({
      filename: "app-%DATE%-rejections.log",
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
  ],
});

export default logger;
