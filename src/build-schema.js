const { buildDatasource } = require('./build-datasource');

const buildSchema = async ({ datasourcePaths }) => {
  const sources = new Array(datasourcePaths.length);

  for (const path of datasourcePaths) {
    const source = await buildDatasource(path);

    sources.push(source);
  }
};

module.exports = {
  buildSchema,
};
