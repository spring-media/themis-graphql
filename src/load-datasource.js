const validateDatasource = require('./validate-datasource');
const logger = require('./logger');
const { makeExecutableSchema } = require('graphql-tools');
const { loadRemoteSchema } = require('./load-remote-schema');

// eslint-disable-next-line complexity
const loadDatasource = async (sourcePath, { mockMode }) => {
  const schemas = [];
  const context = {};

  logger.info(`Loading ${sourcePath}`);
  const config = require(sourcePath);

  validateDatasource(config);

  if (config.remote) {
    const schema = await loadRemoteSchema(config.remote);

    logger.debug(`Loaded remote Schema ${sourcePath}`);

    if (config.remote.accessViaContext) {
      context[config.remote.accessViaContext] = schema;
    }

    if (config.remote.mount) {
      schemas.push(schema);
    }
  } else {
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

    schemas.push(schema);
  }

  return { schemas, context };
};

module.exports = { loadDatasource };
