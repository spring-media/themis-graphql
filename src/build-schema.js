const { buildModule } = require('./build-module');

const buildSchema = async ({ modulePaths, pretty = false }) => {
  const sources = new Array(modulePaths.length);

  for (const path of modulePaths) {
    const source = await buildModule(path, { pretty });

    sources.push(source);
  }
};

module.exports = {
  buildSchema,
};
