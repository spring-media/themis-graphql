const { Logger, transports, config } = require('winston');
const { isProd } = require('../utils');

const formatMessage = ({ level, message, meta = {}, colorize }) => {
  let result = colorize ? config.colorize(level) : level;

  // Prepend the request ID to the message
  // eslint-disable-next-line newline-after-var
  let messageStr = message;
  if (meta.requestId) {
    messageStr = `[${meta.requestId}] ${messageStr}`;
  }

  result += ` ${messageStr}`;

  // Add the metadata (if any), but omit the request ID
  // eslint-disable-next-line newline-after-var
  const otherMeta = { ...meta };
  delete otherMeta.requestId;

  if (Object.entries(otherMeta).length) {
    result += ` ${JSON.stringify(otherMeta)}`;
  }

  return result;
};

const createLogger = options => {
  return new (Logger)({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      new transports.Console({
        colorize: !isProd,
        formatter: formatMessage,
      }),
    ],
    ...options,
  });
};

module.exports = { createLogger };
