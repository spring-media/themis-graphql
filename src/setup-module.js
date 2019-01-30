const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const { loadRemoteSchema } = require('./load-remote-schema');
const { loadModule } = require('./load-module');
const { spreadIf } = require('./utils');
const logger = require('./logger');

const setupRemote = async (config, { mockMode, sourcePath, useFileSchema }) => {
  const remoteResult = await loadRemoteSchema(config, sourcePath, { mockMode, useFileSchema });
  const { schema, link } = remoteResult;
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
    logger,
  });

  return {
    schema: executableSchema,
  };
};

const setupLocal = config => {
  const { typeDefs, extendTypes, resolvers, extendResolvers } = config;
  const source = {};

  if (typeDefs) {
    source.schema = makeExecutableSchema({
      typeDefs,
      resolvers,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      logger,
    });
  }

  if (extendTypes) {
    source.extendTypes = extendTypes;
    source.extendResolvers = extendResolvers;
  }

  return source;
};

const setupLocalOrRemoteSource = (config, opts) => {
  if (config.remote) {
    return setupRemote(config, opts);
  }
  return setupLocal(config, opts);
};

// eslint-disable-next-line complexity
const setupModule = async (sourcePath, { mockMode, useFileSchema }) => {
  const config = await loadModule(sourcePath);
  const source = await setupLocalOrRemoteSource(config, {
    mockMode,
    sourcePath,
    useFileSchema,
  });

  if (source.schema) {
    Object.assign(source.schema, {
      moduleName: config.name,
    });

    if (mockMode && config.mocks) {
      addMockFunctionsToSchema({ schema: source.schema, mocks: config.mocks });
    }

    if (Array.isArray(config.transforms)) {
      source.schema = transformSchema(source.schema, config.transforms);
    }
  }

  return {
    ...config,
    ...spreadIf(config.mount !== false, {
      schema: source.schema,
      resolvers: source.resolvers,
    }),
    accessViaContext: {
      [config.name]: source.schema,
    },
    sourcePath,
  };
};

module.exports = { setupModule };
