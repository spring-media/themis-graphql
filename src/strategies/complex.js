const {
  makeExecutableSchema,
  mergeSchemas,
  FilterRootFields,
  transformSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const { insertIfValue, insertIf } = require('../utils');
const { GraphQLSchema } = require('graphql');
const { findTypeConflict } = require('../find-type-conflict');

function checkTypeConflict (schemas, importTypes, logger) {
  // graphql-tools removed the onTypeConflict resultion in mergeSchemas
  // https://github.com/apollographql/graphql-tools/issues/863
  // and there is no substituion. We check for type conflicts here manually,
  // to trigger warnings for conflicts. We ignore common types though,
  // as they can be merged just fine usually. There should be a
  // solution with schema transforms to do type selection (left/right),
  // which we should make available via the config file for module stitching.
  const ignoreTypeCheck = [
    'Query', 'ID', 'Int', 'String', 'Subscription',
    'Boolean', 'JSON', 'Mutation',
  ].concat(importTypes);

  findTypeConflict(
    schemas.filter(maybeSchema => maybeSchema instanceof GraphQLSchema),
    {
      ignoreTypeCheck,
      ignoreFieldCheck: importTypes,
      onTypeConflict: (left, right, info) => {
        logger.warn(
          `Type Collision for "${left.name}" from "${
            info.left.schema.moduleName
          }" ` + `to "${info.right.schema.moduleName}".`
        );
      },
      onFieldConflict: (fieldName, left, right, info) => {
        logger.warn(
          `Field Collision in "${info.left.type.name}.${fieldName}" ` +
            `from "${info.left.schema.moduleName}" to "${
              info.right.schema.moduleName
            }".`
        );
      },
    }
  );
}

module.exports = {
  merge (srcs, { filterSubscriptions, mockMode, logger }) {
    const accessViaContext = {};
    // eslint-disable-next-line complexity
    const schemas = srcs.map(source => {
      let schema = null;

      if (source.allTypes && source.allTypes.length > 0) {
        schema = makeExecutableSchema({
          typeDefs: source.allTypes,
          resolvers: source.allResolvers,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
          logger,
        });
      } else if (source.remote) {
        schema = source.schema;
      }

      if (schema) {
        Object.assign(schema, {
          moduleName: source.name,
        });

        if (mockMode && source.mocks) {
          addMockFunctionsToSchema({ schema, mocks: source.mocks });
        }

        if (Array.isArray(source.transforms)) {
          schema = transformSchema(schema, source.transforms);
        }

        accessViaContext[source.name] = schema;

        if (source.mount) {
          return schema;
        }
      }
    }).filter(Boolean);

    const context = [];
    const {
      extendTypes,
      extendResolvers,
      importTypes,
      remoteSchemas,
    } = srcs
    .reduce((p, c) => ({
      remoteSchemas: [ ...p.remoteSchemas, ...insertIf(c.schema && c.mount, c.schema) ],
      extendTypes: [ ...p.extendTypes, ...insertIfValue(c.extendTypes) ],
      extendResolvers: [ ...p.extendResolvers, ...insertIfValue(c.extendResolvers) ],
      importTypes: [ ...p.importTypes, ...(c.importTypes ?
        Object.keys(c.importTypes).reduce((prev, key) => [ ...prev, ...c.importTypes[key] ], []) :
        []
      ) ],
    }), {
      remoteSchemas: [],
      extendTypes: [],
      extendResolvers: [],
      importTypes: [],
    });

    context.push(() => ({
      schemas: accessViaContext,
    }));

    schemas.push(...remoteSchemas);

    checkTypeConflict(schemas, importTypes, logger);

    schemas.push(...extendTypes);

    let mergedSchema = mergeSchemas({
      schemas,
      resolvers: extendResolvers,
    });

    if (filterSubscriptions) {
      mergedSchema = transformSchema(mergedSchema, [
        new FilterRootFields(op => op !== 'Subscription'),
      ]);
    }

    return { schema: mergedSchema, context };
  },
};
