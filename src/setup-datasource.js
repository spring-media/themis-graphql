const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const { loadRemoteSchema } = require('./load-remote-schema');
const { loadDatasource } = require('./load-datasource');
const { spreadIf } = require('./utils');

const setupRemote = async (config, { mockMode, sourcePath, useFileSchema }) => {
  const remoteResult = await loadRemoteSchema(config, sourcePath, { mockMode, useFileSchema });
  const { schema, link } = remoteResult;
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
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
    });
  }

  if (extendTypes) {
    source.extendTypes = extendTypes;
    source.resolvers = extendResolvers;
  }

  return source;
};

const setupLocalOrRemoteSource = (config, opts) => {
  if (config.remote) {
    return setupRemote(config, opts);
  }
  return setupLocal(config, opts);
};

const setupDatasource = async (sourcePath, { mockMode, useFileSchema }) => {
  const config = await loadDatasource(sourcePath);
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
      ...spreadIf(config.accessViaContext, {
        [config.accessViaContext]: source.schema,
      }),
    },
    sourcePath,
  };
};

module.exports = { setupDatasource };
