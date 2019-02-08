const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');

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
    importTypes,
    resolvedDependencies,
  } = config;
  const source = {};
  const types = [].concat(typeDefs);
  const allResolvers = [resolvers];

  if (importTypes) {
    Object.keys(importTypes).forEach(moduleName => {
      const typeNamesToImport = importTypes[moduleName];
      const importTypeDefs = resolvedDependencies[moduleName].typeDefs;
      const importResolvers = resolvedDependencies[moduleName].resolvers;

      if (!Array.isArray(typeNamesToImport)) {
        throw new Error('Types to import must be an array with type names');
      }

      const importedTypes = {
        ...importTypeDefs,
        definitions: importTypeDefs.definitions.filter(typeDef => {
          return typeNamesToImport.includes(typeDef.name.value);
        }),
      };

      const importedResolvers = typeNamesToImport.reduce((p, c) =>
        Object.assign(p, spreadIf(importResolvers[c], { [c]: importResolvers[c] })), {});

      types.unshift(importedTypes);
      allResolvers.unshift(importedResolvers);
    });
  }

  if (extendTypes) {
    source.extendTypes = extendTypes;
    source.extendResolvers = [].concat(extendResolvers);
  }

  if (types.length) {
    source.schema = makeExecutableSchema({
      typeDefs: types,
      resolvers: allResolvers,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      logger,
    });
  }

  return source;
};

const setupLocalOrRemoteSource = (config, opts) => {
  if (config.remote) {
    return setupRemote(config, opts);
  }
  return setupLocal(config, opts);
};

const state = {
  sourceCache: {},
};

// eslint-disable-next-line complexity
const setupModule = async (config, { mockMode, useFileSchema }) => {
  if (state.sourceCache[config.sourcePath]) {
    return state.sourceCache[config.sourcePath];
  }

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

  const fullSource = {
    ...config,
    ...spreadIf(config.mount !== false, {
      schema: source.schema,
    }),
    accessViaContext: {
      [config.name]: source.schema,
    },
    importedInterfaces: source.importedInterfaces,
  };

  state.sourceCache[config.sourcePath] = fullSource;

  return fullSource;
};

function clearModuleCache () {
  state.sourceCache = {};
}

module.exports = { setupModule, clearModuleCache };
