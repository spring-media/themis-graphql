const uuidv4 = require('uuid/v4');
const nsid = uuidv4();

let reqId = undefined;

/**
 * Express.js middleware
 * responsible for retrieving and saving the request id
 * @return {function} express middleware
 **/
const middleware = () => {
	return (req, res, next) => {
		reqId = req.header('X-Request-ID') || undefined;
		next();
	};
};

/**
 * Gets the request id
 * Will return undefined  if the context has not yet been initialized
 * for this request or if there is no value present.
 * @return {String} the current request id
 **/
function get () {
	return reqId;
}

module.exports = { middleware, get };
