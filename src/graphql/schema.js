const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { 
  introspectSchema, 
  makeRemoteExecutableSchema, 
  makeExecutableSchema,
  transformSchema,
  FilterRootFields,
  delegateToSchema
} = require('graphql-tools');
const Article = require('./article/schema')
const logger = require('./../logger')

const { ARTICLE_GRAPHQL_ENDPOINT, ARTICLE_GRAPHQL_TOKEN } = process.env;

const http = new HttpLink({ 
  uri: ARTICLE_GRAPHQL_ENDPOINT, 
  fetch: async (...args) => {
    try {
      const result = await fetch(...args)
      logger.debug('Remote fetch result:', result)
      return result
    } catch (err) {
      logger.error(err)
    }  
  }
});

const link = setContext((request, previousContext) => ({
  headers: {
    'authorization': `${ARTICLE_GRAPHQL_TOKEN}`,
  }
})).concat(http);

const rootFieldFilter = new FilterRootFields((op, fieldname) => {
  if (['Query'].includes(op)) {
    if ([
      'article', 'articles', 'teaser', 'channels'
    ].includes(fieldname))
    return true
  }
  return false
})

module.exports = async () => {
  const remoteSchema = await introspectSchema(link);
  
  const executableSchema = makeRemoteExecutableSchema({
    schema: remoteSchema,
    link
  });

  const transformedSchema = transformSchema(executableSchema, [
    rootFieldFilter,
    {
      transformResult: (originalResult) => {
        if (originalResult && originalResult.data) {
          const { article } = originalResult.data
          if (article) {
            // Transform the article result here...
            if (article.headline) {
              article.headline = {
                ...article.headline,
                type: 'slatejs',
                data: 'transformed headline'
              }
            }
          }
        }
        return originalResult
      }
    }
  ])

  const schema = makeExecutableSchema({
    typeDefs: [
      Article
    ],
    resolvers: {
      Query: {
        article: (parent, args, context, info) => {
          return delegateToSchema({
            schema: transformedSchema,
            operation: 'query',
            fieldName: 'article',
            args,
            context,
            info
          })
        }
      },
      Article: {
        // Example on how to extend the partial result from the editorial graph with additional fields
        extraRESTInfo: async (...rest) => {
          return await Promise.resolve({ info: 'from another remote endpoint' })
        }
      }
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  })

  return schema
}