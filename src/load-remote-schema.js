const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const logger = require('./logger');
const fetch = require('node-fetch');
const { introspectionQuery, parse } = require('graphql');
const {
  introspectSchema,
} = require('graphql-tools');
const { makePromise, execute } = require('apollo-link');
const { buildClientSchema } = require('graphql');
const path = require('path');

const parsedIntrospectionQuery = parse(introspectionQuery);

const loadFileSchema = async (config, sourcePath) => {
  const schemaPath = path.join(sourcePath, 'dist');
  const schemaFilePath = path.join(schemaPath, '_remote_schema.json');
  const jsonSchema = require(schemaFilePath);
	const schema = buildClientSchema(jsonSchema.data);
	return schema;
};

const makeRemoteHTTPLink = ({ uri }) => {
  const link = new HttpLink({
    uri,
    fetch: async (...args) => {
      const result = await fetch(...args);

      logger.debug('Remote fetch args:', args);

      return result;
    },
  });

  return link;
};

const loadRemoteSchema = async (config, sourcePath, { mockMode }) => {
  const {
    linkContext,
    uri,
  } = config;
  const http = makeRemoteHTTPLink({ uri });

  const link = linkContext ? setContext(linkContext).concat(http) : http;

  const schema = mockMode || process.env.NODE_ENV === 'production' 
    ? await loadFileSchema(config, sourcePath) 
    : await introspectSchema(link);

  return { schema, link };
};

function linkToFetcher (link) {
  return async function (fetcherOperation) {
    return makePromise(execute(link, fetcherOperation));
  };
}

const loadIntrospectionSchema = async (link, linkContext) => {
  const fetcher = linkToFetcher(link);
  const rawSchema = await fetcher({
    query: parsedIntrospectionQuery,
    context: linkContext,
  });

  return rawSchema;
};

module.exports = { loadRemoteSchema, makeRemoteHTTPLink, loadIntrospectionSchema };
