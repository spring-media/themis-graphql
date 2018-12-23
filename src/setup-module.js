const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  addMockFunctionsToSchema,
  FilterRootFields,
} = require('graphql-tools');
const { loadRemoteSchema } = require('./load-remote-schema');
const { loadModule } = require('./load-module');
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

// eslint-disable-next-line complexity
const setupModule = async (sourcePath, { mockMode, useFileSchema, filterSubscriptions }) => {
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

    if (filterSubscriptions) {
      config.transforms = config.transforms || [];
      config.transforms.push(new FilterRootFields(op => op !== 'Subscription'));
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

module.exports = { setupModule };
