const { setupDatasource } = require('./setup-datasource');
const { mergeSchemas } = require('graphql-tools');
const { insertIf } = require('./utils');

const loadSchema = async ({ datasourcePaths, mockMode, productionMode }) => {
  const sources = await Promise.all(datasourcePaths
    .map(path => setupDatasource(path, { mockMode, productionMode })));

  // TODO: Implement namespaces

  const sourceNames = sources.map(config => config.name);

  sources
    .filter(config => config.dependencies)
    .forEach(config => config.dependencies
      .forEach(dependency => {
        if (!sourceNames.includes(dependency)) {
          throw new Error(`Cannot load datasource "${config.name}",` +
            `because missing dependency "${dependency}"`);
        }
      })
    );

  const { schemas, resolvers, context, contextValidations } = sources
    .reduce((p, c) => ({
      schemas: [ ...p.schemas, ...insertIf(c.schema, c.schema), ...insertIf(c.extendTypes, c.extendTypes) ],
      resolvers: [ ...p.resolvers, ...insertIf(c.resolvers, c.resolvers) ],
      context: { ...p.context, ...c.context },
      contextValidations: [
        ...p.contextValidations,
        ...insertIf(c.validateContext, c.validateContext),
      ],
  }), { schemas: [], resolvers: [], context: {}, contextValidations: [] });

  const schema = mergeSchemas({
    schemas,
    resolvers,
  });

  for (const validation of contextValidations) {
    validation(context);
  }

  return { schema, context };
};

module.exports = {
  loadSchema,
};
