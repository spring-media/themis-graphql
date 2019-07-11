const logger = require('./logger');

// eslint-disable-next-line complexity
module.exports = err => {
  if (err.extensions.exception) {
    if (err.extensions.exception.errors) {
      err.extensions.exception.errors.forEach(ex => {
        logger.error(ex.stack || ex);
      });
    } else if (err.extensions.exception.stacktrace) {
      const ex = err.extensions.exception;

      logger.error((ex.stacktrace && ex.stacktrace.join('\n')) || ex);
    }
  } else {
    logger.error(err.message || err);
  }
};
