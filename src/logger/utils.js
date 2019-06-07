const { Logger, transports, config } = require('winston');
const { isProd } = require('../utils');

const createLogger = options => {
  return new (Logger)({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      new transports.Console({
        formatter: ({ level, message, meta = {} }) => {
          const levelStr = !isProd ? config.colorize(level) : level;

          if (meta.requestId) {
            return `${levelStr} [${meta.requestId}] ${message}`;
          }

          return `${levelStr} ${message}`;
        },
      }),
    ],
    ...options,
  });
};

module.exports = { createLogger };
