const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { 
  introspectSchema, 
  makeRemoteExecutableSchema, 
  transformSchema,
  FilterRootFields
} = require('graphql-tools');

const { ARTICLE_GRAPHQL_ENDPOINT, ARTICLE_GRAPHQL_TOKEN } = process.env;

const http = new HttpLink({ uri: ARTICLE_GRAPHQL_ENDPOINT, fetch });

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

  const schema = transformSchema(executableSchema, [
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

  return schema
}