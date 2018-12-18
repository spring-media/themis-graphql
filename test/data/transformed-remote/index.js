const { FilterRootFields } = require('graphql-tools');

module.exports = {
  name: 'transformed-remote',
  remote: {
    uri: 'http://127.0.0.1:51324/api/graphql',
  },
  transforms: [
    new FilterRootFields((op, fieldname) => {
      return op === 'Query' && ['article'].includes(fieldname);
    }),
  ],
};
