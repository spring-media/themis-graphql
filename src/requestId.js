const cls = require('cls-hooked');
const uuidv4 = require('uuid/v4');

const nsid = uuidv4();
const ns = cls.createNamespace(nsid);

/**
 * Express.js middleware
 * responsible for retrieving and saving the request id
 * @return {function} express middleware
 **/
const middleware = () => {
	return (req, res, next) => {
		ns.run(() => {
			if (ns && ns.active) {
				console.log('RequestId: ', req.header('X-Request-ID'));
				ns.set('reqId', req.header('X-Request-ID'));
			}
			next();
		});
	};
};

/**
 * Gets the request id from the context by key
 * Will return undefined if the context has not yet been initialized
 * for this request or if a value is not found for the specified key.
 * @return {String} the current request id
 **/
function get () {
	if (ns && ns.active) {
		return ns.get('reqId');
	}
}

module.exports = { middleware, get };
