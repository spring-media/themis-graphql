const Joi = require('joi');

const uriScheme = {
  scheme: [ 'https', 'http' ],
};

const schema = Joi.object().keys({
  PORT: Joi.string().alphanum().min(2).max(5).required(),
  NODE_ENV: Joi
    .string()
    .regex(/(production|development|test)/)
    .required(),
  ARTICLE_GRAPHQL_ENDPOINT: Joi
    .string()
    .uri()
    .required(),
  ARTICLE_GRAPHQL_TOKEN: Joi
    .string()
    .required(),
}).unknown();

module.exports = function validateEnv () {
  const { error } = Joi.validate(process.env, schema);

  if (error) {
    throw new Error(error);
  }
};
