const { setupDatasource } = require('./setup-datasource');
const { mergeSchemas } = require('graphql-tools');
const { insertIfValue } = require('./utils');

const loadSchema = async ({ datasourcePaths, mockMode, useFileSchema }) => {
  if (datasourcePaths.length === 0) {
    throw new Error('Need at least one target path with datasources.');
  }

  const sources = await Promise.all(datasourcePaths
    .map(path => setupDatasource(path, { mockMode, useFileSchema })));

  // TODO: Implement namespaces

  const sourceNames = sources.map(config => config.name);
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
    throw new Error('Datasource names need to be unique, ' +
      `found duplicates of "${duplicates.join(', ')}"`);
  }

  sources
    .filter(config => config.dependencies)
    .forEach(config => config.dependencies
      .forEach(dependency => {
        if (!sourceNames.includes(dependency)) {
          throw new Error(`Cannot load datasource "${config.name}", ` +
            `because missing dependency "${dependency}"`);
        }
      })
    );

  const {
    schemas,
    resolvers,
    accessViaContext,
    contextValidations,
    context,
    startupFns,
    shutdownFns,
  } = sources
  .reduce((p, c) => ({
    schemas: [ ...p.schemas, ...insertIfValue(c.schema), ...insertIfValue(c.extendTypes) ],
    resolvers: [ ...p.resolvers, ...insertIfValue(c.resolvers) ],
    context: [ ...p.context, ...insertIfValue(c.context) ],
    accessViaContext: { ...p.accessViaContext, ...c.accessViaContext },
    contextValidations: [
      ...p.contextValidations,
      ...insertIfValue(c.validateContext),
    ],
    startupFns: [ ...p.startupFns, ...insertIfValue(c.onStartup) ],
    shutdownFns: [ ...p.shutdownFns, ...insertIfValue(c.onShutdown) ],
  }), {
    schemas: [],
    resolvers: [],
    context: [],
    accessViaContext: {},
    contextValidations: [],
    startupFns: [],
    shutdownFns: [],
  });

  const schema = mergeSchemas({
    schemas,
    resolvers,
  });

  for (const validation of contextValidations) {
    validation(accessViaContext);
  }

  return { schema, accessViaContext, context, startupFns, shutdownFns };
};

module.exports = {
  loadSchema,
};
