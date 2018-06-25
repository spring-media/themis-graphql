const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const logger = require('./logger');
const fetch = require('node-fetch');

const {
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
} = require('graphql-tools');

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

module.exports = { loadRemoteSchema };
