const Axios = require('axios');
const Cheerio = require('cheerio');
const Joi = require('@hapi/joi');
const Cache = require('memory-cache');

const { InvalidConfigError } = require('./errors');
const { generateRandomUserAgent } = require('./helpers');
const Schema = require('./configSchema');

class Rattler {

  constructor(config) {
    const result = Joi.validate(config.scrapeList, Schema);
    if (result.error) {
      throw new InvalidConfigError(`Invalid configuration object - ${result.error}`, result.error);
    }
    this.config = config;
  }

  async extract() {
    const { baseURL, scrapeList } = this.config;
    const userAgent = generateRandomUserAgent();
    const options = {
      headers: {
        'User-Agent': userAgent
      }
    };

    const finalResults = {};
    Cache.clear();

    for (const current of scrapeList) {
      const url = baseURL + current.searchURL;
      let response = Cache.get(url);
      if (response === null) {
        response = await Axios.get(url, options);
        Cache.put(url, response);
      }
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
