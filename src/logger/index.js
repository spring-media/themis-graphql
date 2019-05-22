const winston = require('winston');
const { get: getRequestId } = require('../request-id');

const PrettyError = require('pretty-error');

const { combine, colorize, printf } = winston.format;
const prettyError = new PrettyError();
const prodFormat = getProdFormat();
const devFormat = getDevFormat();
const isProd = process.env.NODE_ENV === 'production';
const format = winston.format((...args) =>
  isProd ? prodFormat.transform(...args) : devFormat.transform(...args)
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false,
  transports: [new winston.transports.Console()],
  format: format(),
});

prettyError.appendStyle({
  'pretty-error': { marginTop: 0 },
  'pretty-error > header': { marginTop: 1 },
  'pretty-error > trace > item': { marginBottom: 0 },
  'pretty-error > trace > item > header > what': { display: 'none' },
  'pretty-error > trace > item > header': { display: 'inline' },
  'pretty-error > trace > item > footer': { display: 'inline' },
  'pretty-error > trace > item > footer > addr': { display: 'inline' },
});

function getProdFormat () {
  const extractError = ({ message, stack }) => ({ message, stack });
  const error = winston.format(info => {
    return info instanceof Error ? { ...info, ...extractError(info) } : info;
  });
  const defaults = winston.format(info => {
    const requestId = getRequestId();
    return {
      ...info,
      ...(requestId ? { requestId } : null),
      source: 'gql-server',
    };
  });

  return combine(error(), defaults(), winston.format.json());
}

function formatObject (param) {
  if (typeof param === 'object') {
    return JSON.stringify(param);
  }
  return param;
}

function getDevFormat () {
  const error = info => prettyError.render(info);
  const noPrefix = info => formatObject(info);
  const message = info => `${info.level} ${formatObject(info.message)}`;
  const extract = info => {
    return info instanceof Error ? error(info) : info.prefix === false ? noPrefix(info) : message(info);
  };

  return combine(colorize(), printf(extract));
}

module.exports = logger;
