const Joi = require('joi');

const uriScheme = {
  scheme: [ 'https', 'http' ],
};

const schema = Joi.object().keys({
  ARTICLE_GRAPHQL_ENDPOINT: Joi
    .string()
    .uri(uriScheme)
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
