const { Logger, transports } = require('winston');
const { isProd } = require('../utils');
const logger = new (Logger)({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new transports.Console({
      colorize: !isProd,
    }),
  ],
});

module.exports = logger;
