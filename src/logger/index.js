const { Logger, transports } = require('winston');
const isProd = process.env.NODE_ENV === 'production';

const logger = new (Logger)({
  level: process.env.LOG_LEVEL || 'warn',
  transports: [
    new transports.Console({
      colorize: !isProd,
    }),
  ],
});

module.exports = logger;
