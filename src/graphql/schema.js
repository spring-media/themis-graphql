const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const {
  introspectSchema,
  makeRemoteExecutableSchema,
  makeExecutableSchema,
  transformSchema,
  FilterRootFields,
  delegateToSchema,
} = require('graphql-tools');
const Article = require('./article');
const logger = require('./../logger');

const { ARTICLE_GRAPHQL_ENDPOINT, ARTICLE_GRAPHQL_TOKEN } = process.env;

const http = new HttpLink({
  uri: ARTICLE_GRAPHQL_ENDPOINT,
  fetch: async (...args) => {
    const result = await fetch(...args);

    logger.debug('Remote fetch args:', args);
    logger.debug('Remote fetch result:', result);
    return result;
  },
});

const link = setContext(() => ({
  headers: {
    'authorization': `${ARTICLE_GRAPHQL_TOKEN}`,
  },
})).concat(http);

const rootFieldFilter = new FilterRootFields((op, fieldname) => {
  return op === 'Query' && [ 'article', 'articles', 'teaser', 'channels' ].includes(fieldname);
});

module.exports = async () => {
  const remoteSchema = await introspectSchema(link);

  const executableSchema = makeRemoteExecutableSchema({
    schema: remoteSchema,
    link,
  });

  const transformedSchema = transformSchema(executableSchema, [
    rootFieldFilter,
  ]);

  const schema = makeExecutableSchema({
    typeDefs: [
      Article.typeDefs,
    ],
    resolvers: {
      Query: {
        ...Article.resolvers.Query,
        article: (parent, args, context, info) => {
          return delegateToSchema({
            schema: transformedSchema,
            operation: 'query',
            fieldName: 'article',
            args,
            context,
            info,
          });
        },
      },
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  });

  return schema;
};
