const logger = require('./logger');
const { loadDatasource } = require('./load-datasource');
const { makeRemoteHTTPLink, loadIntrospectionSchema } = require('./load-remote-schema');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');
const makeDir = promisify(mkdirp);
const writeFile = promisify(fs.writeFile);


const buildRemote = async ({ uri, context, schemaPath }, sourcePath) => {
  const http = makeRemoteHTTPLink({ uri });
  const introspectionSchema = await loadIntrospectionSchema(http, context);
  let schemaDistPath = path.join(sourcePath, 'dist');
  let schemaFilePath = path.join(schemaDistPath, '_remote_schema.json');

  if (schemaPath) {
    if (path.isAbsolute(schemaPath)) {
      schemaDistPath = path.resolve(path.dirname(schemaPath));
      schemaFilePath = path.resolve(schemaPath);
    } else {
      schemaDistPath = path.resolve(sourcePath, path.dirname(schemaPath));
      schemaFilePath = path.resolve(sourcePath, schemaPath);
    }
  }

  await makeDir(schemaDistPath);
  await writeFile(schemaFilePath, JSON.stringify(introspectionSchema));
};

const buildLocal = (/* config, sourcePath */) => {
  // nothing to build yet
};

const buildDatasource = async sourcePath => {
  logger.info(`Building datasource at ${sourcePath}`);
  const config = await loadDatasource(sourcePath);

  if (config.remote) {
    const source = await buildRemote(config.remote, sourcePath);

    logger.debug(`Built remote Schema ${sourcePath}`);
    return source;
  }
  return buildLocal(config, sourcePath);
};

module.exports = { buildDatasource };
