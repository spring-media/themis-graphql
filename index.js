#! /usr/bin/env node
require('dotenv').config();
const { initServer } = require('./src/server');
const { buildSchema } = require('./src/build-schema');
const { loadFileConfig } = require('./src/load-file-config');
const { mountServer } = require('./src/mount-server');
const { runTests } = require('./src/run-tests');
const { spreadIf } = require('./src/utils');
const valideEnv = require('./src/validate-env');
const logger = require('./src/logger');
const program = require('commander');
const path = require('path');
const fs = require('fs');

program
  .name('leto')
  .usage('[options] <datasourcePaths ...>')
  .option('-b, --build', 'Build datasources for production (load and store remote schemas)')
  .option('-t, --test', 'Test datasources with jest and nock')
  .option('--pretty', 'store remote schema as pretty JSON for scm tracking and comparison')
  .option('-c, --config [configPath]', 'Load configuration from a file (resolved relative to cwd, or absolute)')
  .option('-m, --mock', 'Start server in mock mode')
  .option('-n, --nock', 'Start server in nock mode (Load recorded nocks)')
  .option('-r, --record', 'Record external requests with nock (use with --nock)')
  .option('--nockPath [nockPath]', 'Where external request records should go')
  .option('--graphQLPath [graphQLPath]', 'Server path at which the API will be mounted (default: /api/graphql)')
  .option('--subscriptionsPath [path]', 'Server path at which the Subscriptions will be mounted (default: /ws/subscriptions)')
  .option('--keepAlive [keepAlive]', 'Subscription connection keep alive intervall')
  .option('--no-subscriptions', 'Will filter out all subscriptions from schemas')
  .option('-s, --use-subfolders', 'Treat each folder in a datasourcePath as a datasource')
  .option('--introspection', 'Force activate introspection query on Apollo Server')
  .option('--voyager', 'Force activate voyager')
  .option('--playground', 'Force activate playground')
  .option('-d, --debug', 'Run Apollo Server in debug mode');

if (process.argv.find(arg => /-t|--test/.test(arg))) {
  program.allowUnknownOption();
}

program.parse(process.argv);

valideEnv();

const datasourcePaths = program.useSubfolders ?
  program.args.map(arg => {
    const dir = fs.readdirSync(arg);

    return dir.map(p => path.resolve(arg, p));
  }).reduce((p, c) => p.concat(c), []) :
  program.args.map(arg => path.resolve(arg));

const {
  middleware,
  context,
  onStartup,
  onShutdown,
  datasources,
} = loadFileConfig(program.config);

datasourcePaths.push(...datasources);

if (program.build) {
  buildSchema({
    datasourcePaths,
    pretty: program.pretty,
  })
  .then(() => logger.info('Build Done.'));
} else if (program.test) {
  runTests();
} else {
  initServer({
    mockMode: program.mock || false,
    nockMode: program.nock,
    nockPath: program.nockPath,
    nockRecord: program.record,
    datasourcePaths,
    useFileSchema: process.env.NODE_ENV === 'production',
    introspection: program.introspection,
    graphQLPath: program.graphQLPath || process.env.GQL_API_PATH,
    ...spreadIf(program.subscriptions, {
      subscriptions: {
        path: program.subscriptionsPath || process.env.GQL_SUBSCRIPTIONS_PATH,
        keepAlive: program.keepAlive || process.env.GQL_SUBSCRIPTION_KEEPALIVE,
      },
    }, {
      subscriptions: false,
    }),
    middleware,
    context,
    debug: program.debug || process.env.NODE_ENV === 'development',
    tracing: process.env.GQL_TRACING === 'true',
    engineApiKey: process.env.APOLLO_ENGINE_API_KEY,
    onStartup,
    onShutdown,
    cacheControl: {
      defaultMaxAge: parseInt(process.env.GQL_CACHE_CONTROL_MAX_AGE, 10) || 15,
    },
    voyager: program.voyager || process.env.NODE_ENV !== 'production',
    playground: program.playground || process.env.NODE_ENV !== 'production',
  })
  .then(mountServer);
}

process.on('unhandledRejection', err => {
  logger.error(err);
});

process.on('uncaughtException', err => {
  logger.error(err);
});
