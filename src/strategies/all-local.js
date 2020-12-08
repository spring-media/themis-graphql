const {
  makeExecutableSchema,
  mergeSchemas,
  FilterRootFields,
  transformSchema,
} = require('graphql-tools');
const { insertIfValue, insertIf } = require('../utils');

module.exports = {
  merge(srcs, { filterSubscriptions, mergedSchemaTransforms = [], logger }) {
    const { typeDefs, resolvers, remoteSchemas } = srcs.reduce(
      (p, c) => ({
        typeDefs: [...p.typeDefs, ...insertIf(!c.remote, c.typeDefs)],
        resolvers: [...p.resolvers, ...insertIfValue(c.resolvers)],
        remoteSchemas: [
          ...p.remoteSchemas,
          ...insertIf(c.schema && c.mount, c.schema),
        ],
        extendTypes: [...p.extendTypes, ...insertIfValue(c.extendTypes)],
        extendResolvers: [
          ...p.extendResolvers,
          ...insertIfValue(c.extendResolvers),
        ],
      }),
      {
        typeDefs: [],
        resolvers: [],
        remoteSchemas: [],
        extendTypes: [],
        extendResolvers: [],
      }
    );

    const localSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      logger,
    });

    let schema = mergeSchemas({
      schemas: [localSchema, ...remoteSchemas],
    });

    if (filterSubscriptions) {
      schema = transformSchema(schema, [
        new FilterRootFields(op => op !== 'Subscription'),
      ]);
    }

    // schema transformations on the final schema
    if (mergedSchemaTransforms.length) {
      schema = transformSchema(schema, mergedSchemaTransforms);
    }

    return { schema };
  },
};
