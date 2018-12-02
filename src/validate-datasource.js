
/**
 * Checks if the imported datasource exports the needed data to stitch and mount it.
 */
const Joi = require('joi');

const schema = Joi.alternatives().try([
  Joi.object().keys({
    namespace: Joi.string().required(),
    typeDefs: Joi.object(),
    extendTypes: Joi.object(),
    resolvers: Joi.object(),
    extendResolvers: Joi.object(),
    mocks: Joi.object().required(),
    validateContext: Joi.func(),
    accessViaContext: Joi.string(),
    mount: Joi.bool(),
  }).with('typeDefs', 'resolvers').with('extendTypes', 'extendResolvers'),
  Joi.object().keys({
    namespace: Joi.string().required(),
    mount: Joi.bool(),
    mocks: Joi.object(),
    validateContext: Joi.func(),
    accessViaContext: Joi.string(),
    remote: Joi.object().keys({
      uri: Joi.string().uri().required(),
      schemaPath: Joi.string(),
      linkContext: Joi.func(),
      transforms: Joi.array(),
    }).required(),
  }),
]);

module.exports = function validateDatasource (source, sourcePath) {
  const { error } = Joi.validate(source, schema);

  if (error) {
    error.message = `${error.message} at ${sourcePath}`;
    throw new Error(error);
  }
};
