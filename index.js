#! /usr/bin/env node
require('dotenv').config();
const { initServer } = require('./src/server');
const { buildSchema } = require('./src/build-schema');
const valideEnv = require('./src/validate-env');
const logger = require('./src/logger');
const program = require('commander');
const path = require('path');
const fs = require('fs');

program
  .name('gql')
  .usage('[options] <datasourcePaths ...>')
  .option('-b, --build', 'Build datasources for production (load and store remote schemas)')
  .option('--pretty', 'store remote schema as pretty JSON for scm tracking and comparison')
  .option('-m, --mock', 'Start server in mock mode')
  .option('-n, --nock', 'Start server in nock mode (Load recorded nocks)')
  .option('-r, --record', 'Record external requests with nock')
  .option('-p, --nockPath [nockPath]', 'Where external request records should go')
  .option('-s, --use-subfolders', 'Treat each folder in a datasourcePath as a datasource');

program.parse(process.argv);

const datasourcePaths = program.useSubfolders ?
  program.args.map(arg => {
    const dir = fs.readdirSync(arg);

    return dir.map(p => path.resolve(arg, p));
  }).reduce((p, c) => p.concat(c), []) :
  program.args.map(arg => path.resolve(arg));

valideEnv();

if (program.build) {
  buildSchema({
    datasourcePaths,
    pretty: program.pretty,
  })
  .then(() => logger.info('Build Done.'));
} else {
  initServer({
    mockMode: program.mock || false,
    nockMode: program.nock,
    nockPath: program.nockPath || null,
    nockRecord: program.record,
    datasourcePaths,
    productionMode: process.env.NODE_ENV === 'production',
  }).then(server => {
    server.listen(process.env.PORT || 8484, () => {
      const { address, port } = server.address();

      logger.info(`RED GQL Aggregation Server running at ${address}:${port}`);
    });
  });
}

process.on('unhandledRejection', err => {
  logger.error(err);
});

process.on('uncaughtException', err => {
  logger.error(err);
});
