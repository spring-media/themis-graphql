const { Logger, transports } = require('winston');
const isDev = process.env.NODE_ENV !== 'production';

const logger = new (Logger)({
  transports: [
    new transports.Console({
      colorize: isDev,
      level: process.env.LOG_LEVEL || 'error',
    }),
  ],
});

module.exports = logger;
