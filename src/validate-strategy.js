
const Joi = require('joi');

const schema = Joi.object().keys({
  merge: Joi.func(),
});

module.exports = function validateStrategy (strategy, strategyPath) {
  const { error, value } = Joi.validate(strategy, schema);

  if (error) {
    error.message = `${error.message} at ${strategyPath}`;
    throw new Error(error);
  }
  return value;
};
