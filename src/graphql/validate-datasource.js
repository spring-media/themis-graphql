const Joi = require('joi');

const schema = Joi.alternatives().try([
  Joi.object().keys({
    typeDefs: Joi.object().required(),
    resolvers: Joi.object().required(),
    mocks: Joi.object().required(),
  }),
  Joi.object().keys({
    remote: Joi.object().required(),
  }),
]);

module.exports = function validateDatasource (source) {
  const { error } = Joi.validate(source, schema);

  if (error) {
    throw new Error(error);
  }
};
