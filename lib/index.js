const Axios = require('axios');
const Cheerio = require('cheerio');
const Joi = require('@hapi/joi');

const { InvalidConfigError } = require('./errors');
const { generateRandomUserAgent } = require('./helpers');
const Schema = require('./configSchema');

class Rattler {

  constructor(config) {
    const result = Joi.validate(config.extract, Schema);
    if (result.error) {
      throw new InvalidConfigError(`Invalid configuration object - ${result.error}`, result.error);
    }
    this.config = config;
  }

  async extract() {
    const { baseURL, extract } = this.config;
    const userAgent = generateRandomUserAgent();
    const options = {
      headers: {
        'User-Agent': userAgent
      }
    };

    const finalResults = {};

    for (const current of extract) {
      const url = baseURL + current.from;
      const response = await Axios.get(url, options);
      const $ = Cheerio.load(response.data);
      const extracted = {
        extractedFrom: url,
        extractedWith: current.path,
        extractedInfo: $(current.path).text()
      };
      finalResults[current.label] = extracted;
    }

    return finalResults;
  }

}

module.exports = {
  Rattler
};
