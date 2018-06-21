const path = require('path');
const pact = require('pact');

global.port = 8989;
global.provider = pact({
	port: global.port,
	log: path.resolve(process.cwd(), 'dist/logs', 'mockserver-integration.log'),
	dir: path.resolve(process.cwd(), 'dist/reports/pacts'),
	spec: 2,
	pactfileWriteMode: 'update',
	consumer: 'MyConsumer',
	provider: 'MyProvider',
});
