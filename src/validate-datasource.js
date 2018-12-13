
/**
 * Checks if the imported datasource exports the needed data to stitch and mount it.
 */
const BaseJoi = require('joi');
const packageNameExtension = require('./joi-extensions/npm-package-name');
const Joi = BaseJoi.extend(packageNameExtension);

const schema = Joi.alternatives().try([
  Joi.object().keys({
    name: Joi.string().packageName().required(),
    namespace: Joi.string(),
    typeDefs: Joi.object(),
    extendTypes: Joi.object(),
    resolvers: Joi.object(),
    extendResolvers: Joi.object(),
    mocks: Joi.object(),
    validateContext: Joi.func(),
    accessViaContext: Joi.string(),
    context: Joi.func(),
    mount: Joi.bool(),
    dependencies: Joi.array().items(Joi.string()),
    onStartup: Joi.func(),
    onShutdown: Joi.func(),
  }).with('typeDefs', 'resolvers').with('extendTypes', 'extendResolvers'),
  Joi.object().keys({
    name: Joi.string().packageName().required(),
    namespace: Joi.string(),
    mount: Joi.bool(),
    mocks: Joi.object(),
    validateContext: Joi.func(),
    accessViaContext: Joi.string(),
    context: Joi.func(),
    remote: Joi.object().keys({
      uri: Joi.string().uri().required(),
      wsUri: Joi.string().uri(),
      schemaPath: Joi.string(),
      linkContext: Joi.func(),
      transforms: Joi.array(),
    }).required(),
    dependencies: Joi.array().items(Joi.string()),
    onStartup: Joi.func(),
    onShutdown: Joi.func(),
  }),
]);

module.exports = function validateDatasource (source, sourcePath) {
  const { error } = Joi.validate(source, schema);

  if (error) {
    error.message = `${error.message} at ${sourcePath}`;
    throw new Error(error);
  }
};
