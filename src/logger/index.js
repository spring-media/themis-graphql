const { createLogger, format, transports } = require('winston');
const jsonStringify = require('fast-safe-stringify');
const { isDev } = require('../utils');

const formatMessage = info => {
  let result = info.level;

  if (info.requestId) {
    result += ` [${info.requestId}]`;
    delete info.requestId;
  }

  result += `: ${info.message}`;

  /* eslint-disable no-undefined */
  const stringifiedRest = jsonStringify({
    ...info,
    level: undefined,
    message: undefined,
    splat: undefined,
  });
  /* eslint-enable no-undefined */

  if (stringifiedRest !== '{}') {
    result += ` ${stringifiedRest}`;
  }

  return result;
};

const logFormats = [format.printf(formatMessage)];

if (isDev) {
  logFormats.unshift(format.colorize());
}

module.exports = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(...logFormats),
  transports: [new transports.Console()],
  exitOnError: false,
});
