const { setupDatasource } = require('./setup-datasource');
const { mergeSchemas } = require('graphql-tools');
const { insertIfValue } = require('./utils');

const loadSchema = async ({ datasourcePaths, mockMode, useFileSchema }) => {
  const sources = await Promise.all(datasourcePaths
    .map(path => setupDatasource(path, { mockMode, useFileSchema })));

  // TODO: Implement namespaces

  const sourceNames = sources.map(config => config.name);

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

  const { schemas, resolvers, accessViaContext, contextValidations, context } = sources
    .reduce((p, c) => ({
      schemas: [ ...p.schemas, ...insertIfValue(c.schema), ...insertIfValue(c.extendTypes) ],
      resolvers: [ ...p.resolvers, ...insertIfValue(c.resolvers) ],
      context: [ ...p.context, ...insertIfValue(c.context) ],
      accessViaContext: { ...p.accessViaContext, ...c.accessViaContext },
      contextValidations: [
        ...p.contextValidations,
        ...insertIfValue(c.validateContext),
      ],
  }), {
    schemas: [],
    resolvers: [],
    context: [],
    accessViaContext: {},
    contextValidations: [],
  });

  const schema = mergeSchemas({
    schemas,
    resolvers,
  });

  for (const validation of contextValidations) {
    validation(accessViaContext);
  }

  return { schema, accessViaContext, context };
};

module.exports = {
  loadSchema,
};
