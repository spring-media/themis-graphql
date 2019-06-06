const {
  makeExecutableSchema,
  mergeSchemas,
  FilterRootFields,
  transformSchema,
} = require('graphql-tools');
const { insertIfValue, insertIf } = require('../utils');

module.exports = {
  merge (srcs, { filterSubscriptions, logger }) {
    const {
      typeDefs,
      resolvers,
      extendTypes,
      extendResolvers,
      remoteSchemas,
    } = srcs
    .reduce((p, c) => ({
      typeDefs: [ ...p.typeDefs, ...insertIf(!c.remote, c.typeDefs) ],
      resolvers: [ ...p.resolvers, ...insertIfValue(c.resolvers) ],
      remoteSchemas: [ ...p.remoteSchemas, ...insertIf(c.schema && c.mount, c.schema) ],
      extendTypes: [ ...p.extendTypes, ...insertIfValue(c.extendTypes) ],
      extendResolvers: [ ...p.extendResolvers, ...insertIfValue(c.extendResolvers) ],
    }), {
      typeDefs: [],
      resolvers: [],
      remoteSchemas: [],
      extendTypes: [],
      extendResolvers: [],
    });

    const localSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      logger,
    });

    let schema = mergeSchemas({
      schemas: [ localSchema, ...remoteSchemas ],
      // https://github.com/apollographql/graphql-tools/issues/1033
      // Specifying resolvers for merge schemas here again fixes the custom enum value issue.
      // Having the resolvers here again should not be necessary
      // and should be removed when graphql-tools is fixed.
      resolvers,
    });

    if (filterSubscriptions) {
      schema = transformSchema(schema, [
        new FilterRootFields(op => op !== 'Subscription'),
      ]);
    }

    return { schema };
  },
};
