const { setContext } = require('apollo-link-context');
const { ApolloLink } = require('apollo-link');
const { onError } = require('apollo-link-error');
const { HttpLink } = require('apollo-link-http');
const logger = require('./logger');
const fetch = require('node-fetch');
const { introspectionQuery, parse } = require('graphql');
const {
  introspectSchema,
} = require('graphql-tools');
const { makePromise, execute } = require('apollo-link');
const path = require('path');
const { buildClientSchema } = require('graphql');

const parsedIntrospectionQuery = parse(introspectionQuery);

const distPathForConfig = ({ schemaPath }, sourcePath) => {
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

  return { schemaDistPath, schemaFilePath };
};

const loadFileSchema = async (config, sourcePath) => {
  const { schemaFilePath } = distPathForConfig(config, sourcePath);
  const jsonSchema = require(schemaFilePath);
	const schema = buildClientSchema(jsonSchema.data);

	return schema;
};

const makeRemoteHTTPLink = ({ uri, name, sourcePath }) => {
  const relativePath = path.relative(process.cwd(), sourcePath);
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(err => Object.assign(err, {
        message: `[Remote Datasource GraphQL Error in "${name} (${relativePath})"]: ${err.message}`,
      }));
    }

    if (networkError) {
      Object.assign(networkError, {
        message: `[Remote Datasource Network Error in "${name} (${relativePath})"]: ${networkError.message}`,
      });
    }
  });

  const httpLink = new HttpLink({
    uri,
    fetch: async (...args) => {
      logger.debug('Remote fetch args:', args);

      const result = await fetch(...args);

      return result;
    },
  });

  const link = ApolloLink.from([
    errorLink,
    httpLink,
  ]);

  return link;
};

const loadRemoteSchema = async (config, sourcePath, { mockMode, productionMode }) => {
  const { linkContext, uri } = config.remote;
  const { name } = config;

  const http = makeRemoteHTTPLink({
    uri,
    sourcePath,
    name,
  });

  const link = linkContext ? setContext(linkContext).concat(http) : http;

  const schema = mockMode || productionMode ?
    await loadFileSchema(config.remote, sourcePath) :
    await introspectSchema(link);

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

module.exports = {
  loadRemoteSchema,
  makeRemoteHTTPLink,
  loadIntrospectionSchema,
  distPathForConfig,
};
