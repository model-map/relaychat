import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, json, errors } = winston.format;
const LOG_DIR = path.resolve("logs"); // absolute path

// exact-level filters
const errorFilter = winston.format((info) =>
  info.level === "error" ? info : false
)();
const infoFilter = winston.format((info) =>
  info.level === "info" ? info : false
)();

// helper to create rotating transport
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
    // combined log for all levels
    rotate({
      filename: "combined-%DATE%.log",
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
    // exact error logs
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
    // exact info logs
    rotate({
      filename: "app-%DATE%-info.log",
      level: "info",
      format: combine(infoFilter, timestamp(), json()),
    }),
    // FOR CONSOLING HTTP REQUESTS WITH MORGAN
    new winston.transports.Console({
      level: "http", // make sure this includes http messages
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

/* ADDITIONAL INFORMATION HERE

  # EVENT LISTENERS
        // fired when a log file is created
    fileRotateTransport.on('new', (filename) => {});
        // fired when a log file is rotated
        fileRotateTransport.on('rotate', (oldFilename, newFilename) => {});
        // fired when a log file is archived
        fileRotateTransport.on('archive', (zipFilename) => {});
        // fired when a log file is deleted
        fileRotateTransport.on('logRemoved', (removedFilename) => {});

  # CUSTOM TRANSPORTS
      winston-mongodb - transport logs to MongoDB.
      winston-syslog - transport logs to Syslog.
      winston-telegram - send logs to Telegram.
      @logtail/winston - send logs to Better Stack Telemetry.
      winston-mysql - store logs in MySQL.

*/
