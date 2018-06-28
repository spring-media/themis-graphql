const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const logger = require('./logger');
const fetch = require('node-fetch');
const { introspectionQuery, parse } = require('graphql');
const {
  introspectSchema,
} = require('graphql-tools');
const { makePromise, execute } = require('apollo-link');

const parsedIntrospectionQuery = parse(introspectionQuery);

const makeRemoteHTTPLink = ({ uri }) => {
  const link = new HttpLink({
    uri,
    fetch: async (...args) => {
      const result = await fetch(...args);

      logger.debug('Remote fetch args:', args);
      logger.debug('Remote fetch result:', result);

      return result;
    },
  });

  return link;
};

const loadRemoteSchema = async ({
  linkContext,
  uri,
}) => {
  const http = makeRemoteHTTPLink({ uri });

  const link = linkContext ? setContext(linkContext).concat(http) : http;

  const schema = await introspectSchema(link);

  return { schema, link };
};

function linkToFetcher (link) {
  return function (fetcherOperation) {
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
