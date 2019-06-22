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
    this.stats = {
        total_requests: 0,
    };
    this.cache = cache;
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
    this.cache.clear();

    for (const current of scrapeList) {
      const url = baseURL + current.searchURL;
      let response = this.cache.get(url);
      if (response === null) {
        response = await Axios.get(url, options).then((res) => {
          this.stats.total_requests++;
          this.cache.put(url,res);
          return res;
        });
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
