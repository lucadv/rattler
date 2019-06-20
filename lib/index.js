const Axios = require('axios');
const Cheerio = require('cheerio');
const Joi = require('joi');

const { InvalidConfigError } = require('./errors');
const { generateRandomUserAgent } = require('./helpers');
const Schema = require('./configSchema');

class Rattler {
  
  constructor(config) {
    const error = Joi.validate(config, Schema);
    if (error) {
      throw new InvalidConfigError(`Invalid configuration object - ${error.err.details.message}`, error.err.details.path);
    }
    this.config = config;
  }

  async extract() {
    const { baseURL, searchURL, cssSelector } = this.config;
    const userAgent = generateRandomUserAgent();
    const url = baseURL + searchURL;
    const options = {
      headers: {
        'User-Agent': userAgent
      }
    };
    const result = await Axios.get(url, options);
    const $ = Cheerio.load(result.data);
    return $(cssSelector).text();
  }

}

module.exports = {
  Rattler: Rattler
};