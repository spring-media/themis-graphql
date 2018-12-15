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
  const { transforms } = config.remote;

  const remoteResult = await loadRemoteSchema(config, sourcePath, { mockMode, useFileSchema });
  const { schema, link } = remoteResult;

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
  });

  let transformedSchema = executableSchema;

  if (Array.isArray(transforms)) {
    transformedSchema = transformSchema(executableSchema, transforms);
  }

  return {
    schema: transformedSchema,
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
  const { schema, resolvers } = await setupLocalOrRemoteSource(config, {
    mockMode,
    sourcePath,
    useFileSchema,
  });

  if (schema) {
    Object.assign(schema, {
      moduleName: config.name,
    });

    if (mockMode && config.mocks) {
      addMockFunctionsToSchema({ schema, mocks: config.mocks });
    }
  }

  return {
    ...config,
    ...spreadIf(config.mount !== false, {
      schema,
      resolvers,
    }),
    accessViaContext: {
      ...spreadIf(config.accessViaContext, {
        [config.accessViaContext]: schema,
      }),
    },
    sourcePath,
  };
};

module.exports = { setupDatasource };
