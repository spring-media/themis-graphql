/**
 * This is a TEST remote data source
 */
const { FilterRootFields } = require('graphql-tools');
const { ARTICLE_GRAPHQL_ENDPOINT, ARTICLE_GRAPHQL_TOKEN } = process.env;

module.exports = {
  namespace: 'Article',
  accessViaContext: 'cmsSchema',
  mount: false,
  remote: {
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
