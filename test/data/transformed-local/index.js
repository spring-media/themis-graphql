const { FilterRootFields } = require('graphql-tools');
const articleSource = require('../cms_article');

module.exports = {
  ...articleSource,
  name: 'transformed-local',
  transforms: [
    new FilterRootFields((op, fieldname) => {
      return op === 'Query' && ['article'].includes(fieldname);
    }),
  ],
};
