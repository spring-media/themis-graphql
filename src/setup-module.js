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
  const remoteResult = await loadRemoteSchema(config, sourcePath, {
    mockMode,
    useFileSchema,
  });
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
    name,
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

  // TODO: HACK add non-strict config var
  if (process.env.NON_STRICT) {
    source.typeDefs = typeDefs;
    source.resolvers = allResolvers;
  }

  if (importTypes) {
    Object.keys(importTypes).forEach(moduleName => {
      const importDependency = resolvedDependencies[moduleName];
      const typeNamesToImport = importTypes[moduleName];

      if (!importDependency) {
        throw new Error(
          `The dependency "${moduleName}" could not be loaded from module "${name}"`
        );
      }

      const importTypeDefs = importDependency.typeDefs;

      if (!importTypeDefs) {
        throw new Error(
          `The module "${moduleName}" does not expose any typeDefs ` +
            `to be imported by ${name}`
        );
      }
      const importResolvers = importDependency.resolvers;

      if (!Array.isArray(typeNamesToImport)) {
        throw new Error('Types to import must be an array with type names');
      }

      const importedTypes = {
        ...importTypeDefs,
        definitions: importTypeDefs.definitions.filter(typeDef => {
          return typeNamesToImport.includes(typeDef.name.value);
        }),
      };

      const importedResolvers = typeNamesToImport.reduce(
        (p, c) =>
          Object.assign(
            p,
            spreadIf(importResolvers[c], { [c]: importResolvers[c] })
          ),
        {}
      );

      types.unshift(importedTypes);
      allResolvers.unshift(importedResolvers);
    });
  }

  if (extendTypes) {
    source.extendTypes = extendTypes;
    source.extendResolvers = [].concat(extendResolvers);
  }

  if (!process.env.NON_STRICT && types.length) {
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

  // eslint-disable-next-line complexity
  const cachePromise = Promise.resolve().then(async () => {
    config.resolvedDependencies = {};

    if (config.dependencies) {
      for (const dependencyName of config.dependencies) {
        if (!config.dependencyConfigs[dependencyName]) {
          throw new Error(
            `Cannot load module "${config.name}", ` +
              `because missing dependency "${dependencyName}"`
          );
        }

        config.resolvedDependencies[dependencyName] = await setupModule(
          config.dependencyConfigs[dependencyName],
          {
            mockMode,
            useFileSchema,
          }
        );
      }
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
        addMockFunctionsToSchema({
          schema: source.schema,
          mocks: config.mocks,
        });
      }

      if (Array.isArray(config.transforms)) {
        source.schema = transformSchema(source.schema, config.transforms);
      }
    }

    return {
      ...config,
      ...spreadIf(config.mount !== false, {
        schema: source.schema,
      }),
      resolvers: source.resolvers,
      accessViaContext: {
        [config.name]: source.schema,
      },
      importedInterfaces: source.importedInterfaces,
    };
  });

  state.sourceCache[config.sourcePath] = cachePromise;

  return cachePromise;
};

function clearModuleCache () {
  state.sourceCache = {};
}

module.exports = { setupModule, clearModuleCache };
