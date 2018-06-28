const logger = require('./logger');
const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const { loadRemoteSchema } = require('./load-remote-schema');
const { loadDatasource } = require('./load-datasource');
const { spreadIf } = require('./utils');

const setupRemote = async config => {
  const { transforms } = config;
  const { schema, link } = await loadRemoteSchema(config);

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
  });

  const transformedSchema = transformSchema(executableSchema, transforms);

  return {
    schema: transformedSchema,
  };
};

const setupLocal = config => {
  const { typeDefs, resolvers } = config;
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  });

  return {
    schema,
  };
};

const setupLocalOrRemoteSource = config => {
  if (config.remote) {
    return setupRemote(config.remote);
  }
  return setupLocal(config);
};

const setupDatasource = async (sourcePath, { mockMode }) => {
  const config = await loadDatasource(sourcePath);
  const { schema } = await setupLocalOrRemoteSource(config);

  if (mockMode) {
    if (!config.mocks) {
      logger.warn(`No mocks for ${sourcePath}`);
    }

    addMockFunctionsToSchema({ schema, mocks: config.mocks });
  }

  return {
    ...config,
    ...spreadIf(config.mount !== false, {
      schema,
    }),
    context: {
      ...spreadIf(config.context, config.context),
      ...spreadIf(config.accessViaContext, {
        [config.accessViaContext]: schema,
      }),
    },
    sourcePath,
  };
};

module.exports = { setupDatasource };
