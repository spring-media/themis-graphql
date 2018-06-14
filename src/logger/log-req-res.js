function createReqResLog (logger) {
  return function logReqRes(req, res, next) {
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = (...restArgs) => {
      chunks.push(new Buffer(restArgs[0]));
      oldWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
      if (restArgs[0]) {
        chunks.push(new Buffer(restArgs[0]));
      }
      const body = Buffer.concat(chunks).toString('utf8');

      logger.debug({
        responseData: body
      });

      oldEnd.apply(res, restArgs);
    };

    next();
  }
}

module.exports = createReqResLog;