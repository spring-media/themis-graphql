const { loadDatasource } = require('./load-datasource');
const { mergeSchemas } = require('graphql-tools');

const loadSchema = async ({ datasourcePaths, mockMode }) => {
  const sources = new Array(datasourcePaths.length);

  for (const path of datasourcePaths) {
    const source = await loadDatasource(path, { mockMode });

    sources.push(source);
  }

  const { schemas, context } = sources
    .reduce((p, c) => ({
      schemas: [ ...p.schemas, ...c.schemas ],
      context: { ...p.context, ...c.context },
    }), { schemas: [], context: {} });

    const schema = mergeSchemas({
    schemas,
  });

  return { schema, context };
};

const buildSchema = () => {
  // TODO: Load remote schemas and put them in `dist` folder,
  //       to load them from there in production.
};

module.exports = {
  loadSchema,
  buildSchema,
};
