const Joi = require('@hapi/joi');

const cssSelectorSchema = Joi.string().description('css selector path').required();

const scrapeListSchema = Joi.object().keys({
  label: Joi.string().description('a label to be used in the response object').required(),
  searchURL: Joi.string().description('the url inside the base url from which extract the info'),
  cssSelector: cssSelectorSchema,
  followNext: Joi.object().keys({
    cssSelector: cssSelectorSchema,
    maxDepth: Joi.number().integer().min(1).max(20).required().description('the maximun number'
      + ' of next links that will be followed if found')
  })
});

const configSchema = Joi.object().keys({
  baseURL: Joi.string().description('the base url for which all request will made').required(),
  scrapeList: Joi.array().items(scrapeListSchema).min(1).required()
});

module.exports = configSchema;
