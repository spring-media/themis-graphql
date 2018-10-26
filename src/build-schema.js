const { buildDatasource } = require('./build-datasource');

const buildSchema = async ({ datasourcePaths, pretty = false }) => {
  const sources = new Array(datasourcePaths.length);

  for (const path of datasourcePaths) {
    const source = await buildDatasource(path, { pretty });

    sources.push(source);
  }
};

module.exports = {
  buildSchema,
};
