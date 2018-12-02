/**
 * This is a TEST remote data source
 */
const { FilterRootFields } = require('graphql-tools');

module.exports = {
  name: 'cms',
  namespace: 'Article',
  accessViaContext: 'cmsSchema',
  mount: false,
  remote: {
    uri: 'https://editor.bild-stg.leancms.de/api/graphql',
    linkContext: () => ({
      headers: {
        'authorization': 'dummy-test-token',
      },
    }),
    transforms: [
      new FilterRootFields((op, fieldname) => {
        return op === 'Query' && [ 'article', 'articles', 'teaser', 'channels' ].includes(fieldname);
      }),
    ],
  },
};
