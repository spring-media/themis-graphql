const Joi = require('@hapi/joi');

const middleware = Joi.alternatives([
  Joi.func(),
  Joi.array().items(Joi.alternatives([
    Joi.func(),
    Joi.string(),
  ])),
]);

const schema = Joi.object().keys({
  modules: Joi.array().items(Joi.string()).default([]),
  middleware: Joi.object().keys({
    before: Joi.array().items(middleware).default([]),
    after: Joi.array().items(middleware).default([]),
  }),
  context: Joi.alternatives([
    Joi.func(),
    Joi.array().items(Joi.func()),
  ]).default([]),
  onConnect: Joi.func(),
  onDisconnect: Joi.func(),
  onStartup: Joi.func().default(() => {}),
  onShutdown: Joi.func().default(() => {}),
  formatError: Joi.func(),
  mergedSchemaTransforms: Joi.array().items(Joi.object()).default([]),
  uploads: Joi.boolean().default(true),
});

module.exports = function validateConfig (config, configPath) {
  const { error, value } = schema.validate(config);

  if (error) {
    error.message = `${error.message} at ${configPath}`;
    throw new Error(error);
  }
  return value;
};
