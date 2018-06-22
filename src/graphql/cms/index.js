/**
 * This is a remote data source, which can be accessed for delegation via the query context
 */
const { FilterRootFields } = require('graphql-tools');
const { ARTICLE_GRAPHQL_ENDPOINT, ARTICLE_GRAPHQL_TOKEN } = process.env;

module.exports = {
  remote: {
    accessViaContext: 'cmsSchema',
    mount: false, // Do not merge it with other schemas
    uri: ARTICLE_GRAPHQL_ENDPOINT,
    linkContext: () => ({
      headers: {
        'authorization': `${ARTICLE_GRAPHQL_TOKEN}`,
      },
    }),
    transforms: [
      new FilterRootFields((op, fieldname) => {
        return op === 'Query' && [ 'article', 'articles', 'teaser', 'channels' ].includes(fieldname);
      }),
    ],
  },
};
