const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  PORT: Joi.string().alphanum().min(2).max(5),
  NODE_ENV: Joi
    .string()
    .valid('production', 'development', 'test'),
  LOG_LEVEL: Joi
    .string()
    .valid('debug', 'warn', 'error', 'info'),
  GQL_TRACING: Joi
    .string()
    .valid('true', 'false'),
  GQL_CACHE_CONTROL: Joi
    .string()
    .valid('true', 'false'),
}).unknown();

module.exports = function validateEnv () {
  const { error } = schema.validate(process.env);

  if (error) {
    throw new Error(error);
  }
};
