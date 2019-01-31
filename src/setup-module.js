const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const {
  Kind,
} = require('graphql');
const { loadRemoteSchema } = require('./load-remote-schema');
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
  const {
    typeDefs = [],
    extendTypes,
    resolvers,
    extendResolvers,
    importInterfaces, // ['base']
    resolvedDependencies,
  } = config;
  const source = {
    importedInterfaces: [],
  };

  const types = [].concat(typeDefs);

  if (Array.isArray(importInterfaces)) {
    importInterfaces.forEach(moduleName => {
      const importedTypeDefs = resolvedDependencies[moduleName].typeDefs;
      const interfaceTypes = {
        ...importedTypeDefs,
        definitions: importedTypeDefs.definitions.filter(definition => {
          if (definition.kind === Kind.INTERFACE_TYPE_DEFINITION) {
            source.importedInterfaces.push({
              moduleName,
              definition,
            });
            return true;
          }
          return false;
        }),
      };

      types.push(interfaceTypes);
    });
  }

  if (types.length) {
    source.schema = makeExecutableSchema({
      typeDefs: types,
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
const setupModule = async (config, { mockMode, useFileSchema }) => {
  const source = await setupLocalOrRemoteSource(config, {
    mockMode,
    sourcePath: config.sourcePath,
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
    importedInterfaces: source.importedInterfaces,
  };
};

module.exports = { setupModule };
