const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const {
  introspectSchema,
  makeRemoteExecutableSchema,
  makeExecutableSchema,
  transformSchema,
  mergeSchemas,
} = require('graphql-tools');
const logger = require('./../logger');
const path = require('path');

const loadRemoteSchema = async ({
  linkContext,
  uri,
  transforms = [],
}) => {
  const http = new HttpLink({
    uri,
    fetch: async (...args) => {
      const result = await fetch(...args);

      logger.debug('Remote fetch args:', args);
      logger.debug('Remote fetch result:', result);
      return result;
    },
  });

  const link = linkContext ? setContext(linkContext).concat(http) : http;

  const remoteSchema = await introspectSchema(link);

  const executableSchema = makeRemoteExecutableSchema({
    schema: remoteSchema,
    link,
  });

  const transformedSchema = transformSchema(executableSchema, transforms);

  return transformedSchema;
};

const packages = [
  path.resolve(__dirname, 'article'),
  path.resolve(__dirname, 'cms'),
];

const loadSchema = async ({ mockMode }) => {
  const context = {};
  const schemas = [];

  for (const pack of packages) {
    logger.info(`Loading ${pack}`);
    const config = require(pack);

    if (config.remote) {
      const schema = await loadRemoteSchema(config.remote);

      logger.debug(`Loaded remote Schema ${pack}`);

      if (config.remote.accessViaContext) {
        context[config.remote.accessViaContext] = schema;
      }

      if (config.remote.mount) {
        schemas.push(schema);
      }
    } else {
      const { typeDefs, resolvers } = config;
      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
        resolverValidationOptions: {
          requireResolversForResolveType: false,
        },
      });

      schemas.push(schema);
    }
  }

  const mergedSchema = mergeSchemas({
    schemas,
  });

  return { schema: mergedSchema, context };
};

const buildSchema = () => {
  // TODO: Load remote schemas and put them in `dist` folder,
  //       to load them from there in production.
};

module.exports = {
  loadSchema,
  buildSchema,
};
