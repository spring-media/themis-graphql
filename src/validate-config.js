
/**
 * Checks if the imported datasource exports the needed data to stitch and mount it.
 */
const Joi = require('joi');

const middleware = Joi.alternatives([
  Joi.func(),
  Joi.array().items(Joi.alternatives([
    Joi.func(),
    Joi.string(),
  ])),
]);

const schema = Joi.object().keys({
  datasources: Joi.array().items(Joi.string()).default([]),
  middleware: Joi.object().keys({
    before: Joi.array().items(middleware).default([]),
    after: Joi.array().items(middleware).default([]),
  }),
  context: Joi.alternatives([
    Joi.func(),
    Joi.array().items(Joi.func()),
  ]).default([]),
  onStartup: Joi.func().default(() => {}),
  onShutdown: Joi.func().default(() => {}),
});

module.exports = function validateConfig (config, configPath) {
  const { error, value } = Joi.validate(config, schema);

  if (error) {
    error.message = `${error.message} at ${configPath}`;
    throw new Error(error);
  }
  return value;
};
