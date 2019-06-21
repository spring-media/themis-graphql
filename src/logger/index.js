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

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(...logFormats),
  transports: [new transports.Console()],
  exitOnError: false,
});

// Extend the logger to support calls to `logger.log` with arbitrary objects
// (e. g. errors) that do not include a `level` property. graphql-tools does
// this, but apparently it is not supported in the default Winston 3 logger.
const originalLogFunc = logger.log;

logger.log = (...args) => {
  const info = args[0];

  if (typeof info === 'object' && typeof info.level === 'undefined') {
    info.level = info instanceof Error ? 'error' : 'info';
  }

  return originalLogFunc.apply(logger, args);
};

module.exports = logger;
