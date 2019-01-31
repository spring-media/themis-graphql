const { setupModule } = require('./setup-module');
const {
  mergeSchemas,
  FilterRootFields,
  transformSchema,
} = require('graphql-tools');
const { GraphQLSchema } = require('graphql');
const { insertIfValue } = require('./utils');
const { findTypeConflict } = require('./find-type-conflict');
const { loadModule } = require('./load-module');
const logger = require('./logger');

const loadSchema = async ({ modulePaths, mockMode, useFileSchema, filterSubscriptions }) => {
  if (modulePaths.length === 0) {
    throw new Error('Need at least one target path with modules.');
  }

  const configs = await Promise.all(modulePaths
    .map(path => loadModule(path)));

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

  const moduleMap = configs.reduce((prev, curr) => Object.assign(prev, {
    [curr.name]: curr,
  }), {});

  configs
    .filter(config => config.dependencies)
    .forEach(config => {
      config.resolvedDependencies = config.dependencies
        .reduce((prev, dependencyName) => {
          if (!moduleMap[dependencyName]) {
            throw new Error(`Cannot load module "${config.name}", ` +
              `because missing dependency "${dependencyName}"`);
          }
          return Object.assign(prev, {
            [dependencyName]: moduleMap[dependencyName],
          });
        }, {});
      }
    );

  const sources = await Promise.all(configs
    .map(config => setupModule(config, { mockMode, useFileSchema, filterSubscriptions })));

  const {
    schemas,
    resolvers,
    accessViaContext,
    context,
    startupFns,
    shutdownFns,
  } = sources
  .reduce((p, c) => ({
    schemas: [ ...p.schemas, ...insertIfValue(c.schema), ...insertIfValue(c.extendTypes) ],
    resolvers: [ ...p.resolvers, ...insertIfValue(c.resolvers), ...insertIfValue(c.extendResolvers) ],
    context: [ ...p.context, ...insertIfValue(c.context) ],
    accessViaContext: { ...p.accessViaContext, ...c.accessViaContext },
    startupFns: [ ...p.startupFns, ...insertIfValue(c.onStartup) ],
    shutdownFns: [ ...p.shutdownFns, ...insertIfValue(c.onShutdown) ],
  }), {
    schemas: [],
    resolvers: [],
    context: [],
    accessViaContext: {},
    startupFns: [],
    shutdownFns: [],
  });

  findTypeConflict(schemas.filter(maybeSchema => (maybeSchema instanceof GraphQLSchema)), {
    ignoreTypeCheck: [ 'Query', 'ID', 'Int', 'String', 'Boolean', 'JSON' ],
    onTypeConflict: (left, right, info) => {
      logger.warn(`Type Collision for "${left.name}" from "${info.left.schema.moduleName}" ` +
        `to "${info.right.schema.moduleName}".`);
    },
    onFieldConflict: (fieldName, left, right, info) => {
      logger.warn(`Field Collision in "${info.left.type.name}.${fieldName}" ` +
        `from "${info.left.schema.moduleName}" to "${info.right.schema.moduleName}".`);
    },
  });

  let schema = mergeSchemas({
    schemas,
    resolvers,
  });

  if (filterSubscriptions) {
    schema = transformSchema(schema, [
      new FilterRootFields(op => op !== 'Subscription'),
    ]);
  }

  return { schema, accessViaContext, context, startupFns, shutdownFns };
};

module.exports = {
  loadSchema,
};
