const { setupModule } = require('./setup-module');
const {
  makeExecutableSchema,
  mergeSchemas,
  FilterRootFields,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const { GraphQLSchema } = require('graphql');
const { insertIfValue, insertIf } = require('./utils');
const { findTypeConflict } = require('./find-type-conflict');
const { loadModule } = require('./load-module');
const validateStrategy = require('./validate-strategy');
const logger = require('./logger');
const path = require('path');

function resolveMergeStrategyPath (strategy) {
  if (path.isAbsolute(strategy)) {
    return strategy;
  }
  if (/^.\//.test(strategy)) {
    return path.resolve(process.cwd(), strategy);
  }
  return require.resolve(strategy, {
    paths: [
      ...require.resolve.paths(strategy),
      path.resolve(__dirname, 'strategies'),
    ],
  });
}

function checkTypeConflict (schemas, importTypes) {
  // graphql-tools removed the onTypeConflict resultion in mergeSchemas
  // https://github.com/apollographql/graphql-tools/issues/863
  // and there is no substituion. We check for type conflicts here manually,
  // to trigger warnings for conflicts. We ignore common types though,
  // as they can be merged just fine usually. There should be a
  // solution with schema transforms to do type selection (left/right),
  // which we should make available via the config file for module stitching.
  const ignoreTypeCheck = [
    'Query', 'ID', 'Int', 'String', 'Subscription',
    'Boolean', 'JSON', 'Mutation',
  ].concat(importTypes);

  findTypeConflict(
    schemas.filter(maybeSchema => maybeSchema instanceof GraphQLSchema),
    {
      ignoreTypeCheck,
      ignoreFieldCheck: importTypes,
      onTypeConflict: (left, right, info) => {
        logger.warn(
          `Type Collision for "${left.name}" from "${
            info.left.schema.moduleName
          }" ` + `to "${info.right.schema.moduleName}".`
        );
      },
      onFieldConflict: (fieldName, left, right, info) => {
        logger.warn(
          `Field Collision in "${info.left.type.name}.${fieldName}" ` +
            `from "${info.left.schema.moduleName}" to "${
              info.right.schema.moduleName
            }".`
        );
      },
    }
  );
}

function mergeThatShit (srcs, { filterSubscriptions, mockMode }) {
  const accessViaContext = {};
  // eslint-disable-next-line complexity
  const schemas = srcs.map(source => {
    let schema = null;

    if (source.allTypes && source.allTypes.length > 0) {
      schema = makeExecutableSchema({
        typeDefs: source.allTypes,
        resolvers: source.allResolvers,
        resolverValidationOptions: {
          requireResolversForResolveType: false,
        },
        logger,
      });
    } else if (source.remote) {
      schema = source.schema;
    }

    if (schema) {
      Object.assign(schema, {
        moduleName: source.name,
      });

      if (mockMode && source.mocks) {
        addMockFunctionsToSchema({ schema, mocks: source.mocks });
      }

      if (Array.isArray(source.transforms)) {
        schema = transformSchema(schema, source.transforms);
      }

      accessViaContext[source.name] = schema;

      if (source.mount) {
        return schema;
      }
    }
  }).filter(Boolean);

  const context = [];
  const {
    extendTypes,
    extendResolvers,
    importTypes,
    remoteSchemas,
  } = srcs
  .reduce((p, c) => ({
    remoteSchemas: [ ...p.remoteSchemas, ...insertIf(c.schema && c.mount, c.schema) ],
    extendTypes: [ ...p.extendTypes, ...insertIfValue(c.extendTypes) ],
    extendResolvers: [ ...p.extendResolvers, ...insertIfValue(c.extendResolvers) ],
    importTypes: [ ...p.importTypes, ...(c.importTypes ?
      Object.keys(c.importTypes).reduce((prev, key) => [ ...prev, ...c.importTypes[key] ], []) :
      []
    ) ],
  }), {
    remoteSchemas: [],
    extendTypes: [],
    extendResolvers: [],
    importTypes: [],
  });

  context.push(() => ({
    schemas: accessViaContext,
  }));

  schemas.push(...remoteSchemas, ...extendTypes);

  checkTypeConflict(schemas, importTypes);

  let mergedSchema = mergeSchemas({
    schemas,
    resolvers: extendResolvers,
  });

  if (filterSubscriptions) {
    mergedSchema = transformSchema(mergedSchema, [
      new FilterRootFields(op => op !== 'Subscription'),
    ]);
  }

  return { schema: mergedSchema, context };
}

const loadSchema = async ({
  mergeStrategy,
  modulePaths,
  mockMode,
  useFileSchema,
  filterSubscriptions,
}) => {
  if (modulePaths.length === 0) {
    throw new Error('Need at least one target path with modules.');
  }

  const mergeStrategyPath = resolveMergeStrategyPath(mergeStrategy);
  const strategy = require(mergeStrategyPath);

  validateStrategy(strategy, mergeStrategyPath);

  const configs = await Promise.all(modulePaths
    .map(configPath => loadModule(configPath)));

  // TODO: Implement namespaces

  const sourceNames = configs.map(config => config.name);
  const { duplicates } = sourceNames.reduce((p, name) => {
    if (p.checked.includes(name)) {
      p.duplicates.push(name);
      return p;
    }
    p.checked.push(name);
    return p;
  }, {
    duplicates: [],
    checked: [],
  });

  if (duplicates.length) {
    throw new Error('Module names need to be unique, ' +
      `found duplicates of "${duplicates.join(', ')}"`);
  }

  const moduleConfigMap = configs.reduce((prev, curr) => Object.assign(prev, {
    [curr.name]: curr,
  }), {});

  const sources = await Promise.all(configs
    .map(async config => {
      if (config.dependencies) {
        config.dependencyConfigs = config.dependencies.reduce((p, c) => ({
          ...p,
          [c]: moduleConfigMap[c],
        }), {});
      }

      return setupModule(config, { mockMode, useFileSchema });
    }));

  const {
    context,
    onConnect,
    onDisconnect,
    startupFns,
    shutdownFns,
  } = sources
  .reduce((p, c) => ({
    context: [ ...p.context, ...insertIfValue(c.context) ],
    onConnect: [ ...p.onConnect, ...insertIfValue(c.onConnect) ],
    onDisconnect: [ ...p.onDisconnect, ...insertIfValue(c.onDisconnect) ],
    startupFns: [ ...p.startupFns, ...insertIfValue(c.onStartup) ],
    shutdownFns: [ ...p.shutdownFns, ...insertIfValue(c.onShutdown) ],
  }), {
    context: [],
    onConnect: [],
    onDisconnect: [],
    startupFns: [],
    shutdownFns: [],
  });

  const { schema, context: mergeContext = [] } = mergeThatShit(sources, { filterSubscriptions, mockMode });

  const combinedContext = context.concat(mergeContext);

  return {
    schema,
    context: combinedContext,
    onConnect,
    onDisconnect,
    startupFns,
    shutdownFns,
  };
};

module.exports = {
  loadSchema,
};
