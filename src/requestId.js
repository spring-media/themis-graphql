let reqId = null;

/**
 * Express.js middleware
 * responsible for retrieving and saving the request id
 * @return {function} express middleware
 **/
const middleware = () => {
	return (req, res, next) => {
		reqId = req.header('X-Request-ID') || null;
		next();
	};
};

/**
 * Gets the request id
 * Will return nothing if the context has not yet been initialized
 * for this request or if there is no value present.
 * @return {String} the current request id
 **/
function get () {
  if (reqId) {
    return reqId;
  }
}

module.exports = { middleware, get };
