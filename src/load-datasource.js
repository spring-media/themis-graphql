const validateDatasource = require('./validate-datasource');
const logger = require('./logger');
const { makeExecutableSchema } = require('graphql-tools');
const { loadRemoteSchema } = require('./load-remote-schema');

const setupRemote = async (config, sourcePath, { mockMode }) => {
  const context = {};
  const schemas = [];
  const schema = await loadRemoteSchema(config);

  if (config.accessViaContext) {
    context[config.accessViaContext] = schema;
  }

  if (config.mount) {
    schemas.push(schema);
  }

  return { schemas, context };
};

const setupLocal = (config, sourcePath, { mockMode }) => {
  const { typeDefs, resolvers, mocks } = config;
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  });

  if (mockMode) {
    if (!mocks) {
      logger.warn(`No mocks for ${sourcePath}`);
    }
  }

  return { schemas: [schema], context: {} };
};

const loadDatasource = async sourcePath => {
  logger.info(`Loading ${sourcePath}`);
  const config = require(sourcePath);

  validateDatasource(config);

  return config;
};

const setupDatasource = async (sourcePath, { mockMode }) => {
  const config = await loadDatasource(sourcePath);

  if (config.remote) {
    const source = setupRemote(config.remote, sourcePath, { mockMode });

    logger.debug(`Loaded remote Schema ${sourcePath}`);
    return source;
  }
  return setupLocal(config, sourcePath, { mockMode });
};

module.exports = { setupDatasource, loadDatasource };
