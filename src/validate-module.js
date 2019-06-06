
/**
 * Checks if the imported module exports the needed data to stitch and mount it.
 */
const BaseJoi = require('joi');
const packageNameExtension = require('./joi-extensions/npm-package-name');
const Joi = BaseJoi.extend(packageNameExtension);

const schema = Joi.alternatives().try([
  Joi.object().keys({
    name: Joi.string().packageName().required(),
    namespace: Joi.string(),
    typeDefs: Joi.object(), // TODO: Allow array of typeDefs (test covered)
    importTypes: Joi.object(),
    extendTypes: Joi.object(), // TODO: Allow array (test covered)
    resolvers: Joi.object(), // TODO: Allow array (test covered)
    extendResolvers: Joi.object(), // TODO: Allow array (test covered)
    mocks: Joi.object(),
    context: Joi.func(),
    onConnect: Joi.func(),
    onDisconnect: Joi.func(),
    mount: Joi.bool().default(true),
    transforms: Joi.array(),
    dependencies: Joi.array().items(Joi.string()),
    onStartup: Joi.func(),
    onShutdown: Joi.func(),
  }).with('typeDefs', 'resolvers').with('extendTypes', 'extendResolvers'),
  Joi.object().keys({
    name: Joi.string().packageName().required(),
    namespace: Joi.string(),
    mount: Joi.bool().default(true),
    mocks: Joi.object(),
    context: Joi.func(),
    remote: Joi.object().keys({
      uri: Joi.string().uri().required(),
      wsUri: Joi.string().uri(),
      schemaPath: Joi.string(),
      linkContext: Joi.func(),
    }).required(),
    transforms: Joi.array(),
    onStartup: Joi.func(),
    onShutdown: Joi.func(),
  }),
]);

module.exports = function validateModule (source, sourcePath) {
  const { error, value } = Joi.validate(source, schema);

  if (error) {
    error.message = `${error.message} at ${sourcePath}`;
    throw new Error(error);
  }

  return value;
};
