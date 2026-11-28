import pino, { type Logger, type LoggerOptions } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',
  // never write passwords or tokens into log files
  redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],
  // pretty colored logs while developing, plain JSON in production
  transport: isProduction ? undefined : { target: 'pino-pretty', options: { colorize: true } },
};

export const logger: Logger = pino(options);
