const { setupDatasource } = require('./setup-datasource');
const { mergeSchemas } = require('graphql-tools');
const { insertIf } = require('./utils');

const loadSchema = async ({ datasourcePaths, mockMode }) => {
  const sources = new Array(datasourcePaths.length);

  for (const path of datasourcePaths) {
    const source = await setupDatasource(path, { mockMode });

    sources.push(source);
  }

  // TODO: Implement namespaces

  const { schemas, context, contextValidations } = sources
    .reduce((p, c) => ({
      schemas: [ ...p.schemas, ...insertIf(c.schema, c.schema) ],
      context: { ...p.context, ...c.context },
      contextValidations: [ ...p.contextValidations, ...insertIf(c.validateContext, c.validateContext) ],
    }), { schemas: [], context: {}, contextValidations: [] });

  const schema = mergeSchemas({
    schemas,
  });

  for (const validation of contextValidations) {
    validation(context);
  }

  return { schema, context };
};

module.exports = {
  loadSchema,
};
