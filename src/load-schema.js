const { setupModule } = require('./setup-module');
const {
  mergeSchemas,
  FilterRootFields,
  transformSchema,
  makeExecutableSchema,
} = require('graphql-tools');

const { GraphQLSchema } = require('graphql');
const { insertIfValue } = require('./utils');
const { findTypeConflict } = require('./find-type-conflict');
const { loadModule } = require('./load-module');
const logger = require('./logger');

const loadSchema = async ({
  modulePaths,
  mockMode,
  useFileSchema,
  filterSubscriptions,
}) => {
  if (modulePaths.length === 0) {
    throw new Error('Need at least one target path with modules.');
  }

  const configs = await Promise.all(modulePaths.map(path => loadModule(path)));

  // TODO: Implement namespaces

  const sourceNames = configs.map(config => config.name);
  const { duplicates } = sourceNames.reduce(
    (p, name) => {
      if (p.checked.includes(name)) {
        p.duplicates.push(name);
        return p;
      }
      p.checked.push(name);
      return p;
    },
    {
      duplicates: [],
      checked: [],
    }
  );

  if (duplicates.length) {
    throw new Error(
      'Module names need to be unique, ' +
        `found duplicates of "${duplicates.join(', ')}"`
    );
  }

  const moduleConfigMap = configs.reduce(
    (prev, curr) =>
      Object.assign(prev, {
        [curr.name]: curr,
      }),
    {}
  );

  const sources = await Promise.all(
    configs.map(async config => {
      if (config.dependencies) {
        config.dependencyConfigs = config.dependencies.reduce(
          (p, c) => ({
            ...p,
            [c]: moduleConfigMap[c],
          }),
          {}
        );
      }

      return setupModule(config, { mockMode, useFileSchema });
    })
  );

  const {
    localTypeDefs,
    remoteSchemas,
    schemas,
    resolvers,
    accessViaContext,
    context,
    onConnect,
    onDisconnect,
    startupFns,
    shutdownFns,
    importTypes,
  } = sources.reduce(
    (p, c) => ({
      localTypeDefs: [ ...p.localTypeDefs, c.remote ? null : c.typeDefs ].filter(
        Boolean
      ),
      remoteSchemas: [ ...p.remoteSchemas, c.remote ? c.schema : null ].filter(
        Boolean
      ),
      schemas: [
        ...p.schemas,
        ...insertIfValue(c.schema),
        ...insertIfValue(c.extendTypes),
      ],
      resolvers: [ ...p.resolvers, ...insertIfValue(c.extendResolvers), ...c.resolvers  ],
      context: [ ...p.context, ...insertIfValue(c.context) ],
      onConnect: [ ...p.onConnect, ...insertIfValue(c.onConnect) ],
      onDisconnect: [ ...p.onDisconnect, ...insertIfValue(c.onDisconnect) ],
      accessViaContext: { ...p.accessViaContext, ...c.accessViaContext },
      startupFns: [ ...p.startupFns, ...insertIfValue(c.onStartup) ],
      shutdownFns: [ ...p.shutdownFns, ...insertIfValue(c.onShutdown) ],
      importTypes: [
        ...p.importTypes,
        ...(c.importTypes ?
          Object.keys(c.importTypes).reduce(
              (prev, key) => [ ...prev, ...c.importTypes[key] ],
              []
            ) :
          []),
      ],
    }),
    {
      localTypeDefs: [],
      remoteSchemas: [],
      schemas: [],
      resolvers: [],
      context: [],
      onConnect: [],
      onDisconnect: [],
      accessViaContext: {},
      startupFns: [],
      shutdownFns: [],
      importTypes: [],
    }
  );

  // graphql-tools removed the onTypeConflict resultion in mergeSchemas
  // https://github.com/apollographql/graphql-tools/issues/863
  // and there is no substituion. We check for type conflicts here manually,
  // to trigger warnings for conflicts. We ignore common types though,
  // as they can be merged just fine usually. There should be a
  // solution with schema transforms to do type selection (left/right),
  // which we should make available via the config file for module stitching.
  const ignoreTypeCheck = [
    'Query',
    'ID',
    'Int',
    'String',
    'Subscription',
    'Boolean',
    'JSON',
    'Mutation',
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

  // TODO: HACK use a config value
  if (process.env.NON_STRICT) {
    const localSchema = makeExecutableSchema({
      typeDefs: localTypeDefs,
      resolvers,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      logger,
    });

    let schema = mergeSchemas({
      schemas: [ localSchema, ...remoteSchemas ],
      resolvers,
    });

    if (filterSubscriptions) {
      schema = transformSchema(schema, [
        new FilterRootFields(op => op !== 'Subscription'),
      ]);
    }

    return {
      schema,
      accessViaContext,
      context,
      onConnect,
      onDisconnect,
      startupFns,
      shutdownFns,
    };
  }

  let schema = mergeSchemas({
    schemas,
    resolvers,
  });

  if (filterSubscriptions) {
    schema = transformSchema(schema, [
      new FilterRootFields(op => op !== 'Subscription'),
    ]);
  }

  return {
    schema,
    accessViaContext,
    context,
    onConnect,
    onDisconnect,
    startupFns,
    shutdownFns,
  };
};

module.exports = {
  loadSchema,
};
