const { Logger, transports } = require('winston');
const isProd = process.env.NODE_ENV === 'production';

const logger = new (Logger)({
  transports: [
    new transports.Console({
      colorize: !isProd,
      level: process.env.LOG_LEVEL || 'error',
    }),
  ],
});

module.exports = logger;
