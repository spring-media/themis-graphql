
const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  merge: Joi.func(),
});

module.exports = function validateStrategy (strategy, strategyPath) {
  const { error, value } = schema.validate(strategy);

  if (error) {
    error.message = `${error.message} at ${strategyPath}`;
    throw new Error(error);
  }
  return value;
};
