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
  .name('leto')
  .usage('[options] <datasourcePaths ...>')
  .option('-b, --build', 'Build datasources for production (load and store remote schemas)')
  .option('--pretty', 'store remote schema as pretty JSON for scm tracking and comparison')
  .option('-c, --config [configPath]', 'Load configuration from a file (resolved relative to cwd, or absolute)')
  .option('-m, --mock', 'Start server in mock mode')
  .option('-n, --nock', 'Start server in nock mode (Load recorded nocks)')
  .option('-r, --record', 'Record external requests with nock (use with --nock)')
  .option('--nockPath [nockPath]', 'Where external request records should go')
  .option('--graphQLPath [graphQLPath]', 'Server path at which the API will be mounted (default: /api/graphql)')
  .option('-s, --use-subfolders', 'Treat each folder in a datasourcePath as a datasource')
  .option('--introspection', 'Force activate introspection query on Apollo Server');

program.parse(process.argv);

valideEnv();

const datasourcePaths = program.useSubfolders ?
  program.args.map(arg => {
    const dir = fs.readdirSync(arg);

    return dir.map(p => path.resolve(arg, p));
  }).reduce((p, c) => p.concat(c), []) :
  program.args.map(arg => path.resolve(arg));

const configPath = program.config || 'leto.config';

const resolvedConfigPath = path.isAbsolute(configPath) ?
  configPath :
  path.resolve(process.cwd(), configPath);

if (fs.existsSync(resolvedConfigPath)) {
  const dsConfig = require(resolvedConfigPath);

  if (dsConfig.datasources) {
    const resolvedPaths = dsConfig.datasources
      .map(dsPath => {
        if (!path.isAbsolute(dsPath)) {
          if (/^.\//.test(dsPath)) {
            return path.resolve(process.cwd(), dsPath);
          }
          return require.resolve(dsPath, {
            paths: [
              ...require.resolve.paths(dsPath),
              path.join(process.cwd(), 'node_modules') ],
          });
        }
        return dsPath;
      });

    datasourcePaths.push(...resolvedPaths);
  }
}

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
    nockPath: program.nockPath,
    nockRecord: program.record,
    datasourcePaths,
    productionMode: process.env.NODE_ENV === 'production',
    introspection: program.introspection,
    graphQLPath: program.graphQLPath || process.env.GQL_API_PATH,
  }).then(server => {
    server.listen(process.env.PORT || 8484, () => {
      const { address, port } = server.address();

      logger.info(`RED GQL Aggregation Server running at ${address}:${port}`);
    });

    const shutdown = () => {
      logger.info('Shutting down...');
      server.close();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
}

process.on('unhandledRejection', err => {
  logger.error(err);
});

process.on('uncaughtException', err => {
  logger.error(err);
});
