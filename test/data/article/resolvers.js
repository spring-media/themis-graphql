const { delegateToSchema } = require('graphql-tools');

module.exports = {
  Query: {
    article: (parent, args, context, info) => {
      return delegateToSchema({
        schema: context.schemas.cms,
        operation: 'query',
        fieldName: 'article',
        args,
        context,
        info,
      });
    },
  },
};
