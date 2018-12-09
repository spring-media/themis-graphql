const logger = require('./logger');
const { loadDatasource } = require('./load-datasource');
const { makeRemoteHTTPLink, loadIntrospectionSchema, distPathForConfig } = require('./load-remote-schema');
const { promisify } = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');
const makeDir = promisify(mkdirp);
const writeFile = promisify(fs.writeFile);

const buildRemote = async (config, sourcePath, { pretty }) => {
  const { uri, context, schemaPath } = config.remote;
  const { name } = config;
  const http = makeRemoteHTTPLink({ uri, name, sourcePath });
  const introspectionSchema = await loadIntrospectionSchema(http, context);
  const { schemaDistPath, schemaFilePath } = distPathForConfig({ schemaPath }, sourcePath);

  await makeDir(schemaDistPath);
  const schemaStr = pretty ?
    JSON.stringify(introspectionSchema, null, 2) :
    JSON.stringify(introspectionSchema);

  await writeFile(schemaFilePath, schemaStr);
};

const buildLocal = (/* config, sourcePath */) => {
  // nothing to build yet
};

const buildDatasource = async (sourcePath, { pretty }) => {
  logger.info(`Building datasource at ${sourcePath}`);
  const config = await loadDatasource(sourcePath);

  if (config.remote) {
    const source = await buildRemote(config, sourcePath, { pretty });

    logger.debug(`Built remote Schema ${sourcePath}`);
    return source;
  }
  return buildLocal(config, sourcePath, { pretty });
};

module.exports = { buildDatasource };
