const Joi = require('@hapi/joi');

const extractSchema = Joi.object().keys({
  label: Joi.string().description('a label to be used in the response object').required(),
  searchURL: Joi.string().description('the url inside the base url from which extract the info').required(),
  cssSelector: Joi.string().description('css selector path').required()
});
// max here is an arbitrary number, I'm not really sure
// but my concern is to not overload the server with too many requests
const configSchema = Joi.array().items(extractSchema).min(1).max(10);

module.exports = configSchema;
