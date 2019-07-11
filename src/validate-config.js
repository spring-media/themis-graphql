const Joi = require('joi');

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
  onDisconnect: oi.func(),
  onStartup: Joi.func().default(() => {}),
  onShutdown: Joi.func().default(() => {}),
  formatError: Joi.func().default((err) => err),
});

module.exports = function validateConfig (config, configPath) {
  const { error, value } = Joi.validate(config, schema);

  if (error) {
    error.message = `${error.message} at ${configPath}`;
    throw new Error(error);
  }
  return value;
};
