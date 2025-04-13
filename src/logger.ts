import winston from 'winston';
import config from './config';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.app.logLevel,
  format: winston.format.json(),
  defaultMeta: { service: 'gmail-todoist-app' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: config.app.logFile,
      format: fileFormat,
    }),
  ],
});

export default logger;
