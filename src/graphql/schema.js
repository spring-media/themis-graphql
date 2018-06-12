const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { introspectSchema, makeRemoteExecutableSchema } = require('graphql-tools');

const { ARTICLE_GRAPHQL_ENDPOINT, ARTICLE_GRAPHQL_TOKEN } = process.env;

const http = new HttpLink({ uri: ARTICLE_GRAPHQL_ENDPOINT, fetch });

const link = setContext((request, previousContext) => ({
  headers: {
    'authorization': `${ARTICLE_GRAPHQL_TOKEN}`,
  }
})).concat(http);

module.exports = async () => {
  const schema = await introspectSchema(link);

  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link,
  });

  return executableSchema
}