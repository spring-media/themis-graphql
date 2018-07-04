
const Joi = require('joi');

const schema = Joi.object().keys({
  cmsSchema: Joi.object().required(),
}).unknown();

module.exports = function validateContext (ctx) {
  const { error } = Joi.validate(ctx, schema);

  if (error) {
    throw new Error(error);
  }
};
