const Joi = require('@hapi/joi');

const scrapeListSchema = Joi.object().keys({
  label: Joi.string().description('a label to be used in the response object').required(),
  searchURL: Joi.string().description('the url inside the base url from which extract the info').required(),
  cssSelector: Joi.string().description('css selector path').required()
});

const configSchema = Joi.object().keys({
  baseURL: Joi.string().description('the base url for which all request will made').required(),
  scrapeList: Joi.array().items(scrapeListSchema).min(1).required()
});

module.exports = configSchema;
