
/**
 * Checks if the imported datasource exports the needed data to stitch and mount it.
 */
const Joi = require('joi');

const schema = Joi.object().keys({
  datasources: Joi.array().items(Joi.string()),
  middleware: Joi.object().keys({
    before: Joi.array().items(Joi.alternatives([
      Joi.string(),
      Joi.func(),
    ])),
    after: Joi.array().items(Joi.alternatives([
      Joi.string(),
      Joi.func(),
    ])),
  }),
  context: Joi.alternatives([
    Joi.func(),
    Joi.array().items(Joi.func()),
  ]),
});

module.exports = function validateConfig (config, configPath) {
  const { error } = Joi.validate(config, schema);

  if (error) {
    error.message = `${error.message} at ${configPath}`;
    throw new Error(error);
  }
};
