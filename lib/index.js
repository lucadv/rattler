const Joi = require('@hapi/joi');

const { InvalidConfigError } = require('./errors');
const { generateRandomUserAgent } = require('./helpers');
const Schema = require('./configSchema');
const ScraperFactory = require('./scraperFactory');

const formatResults = (results) => {
  const formattedResults = {};
  results.forEach((res) => {
    const key = Object.keys(res)[0];
    formattedResults[key] = res[key];
  });
  return formattedResults;
};

class Rattler {

  constructor(config) {
    const result = Joi.validate(config, Schema);
    if (result.error) {
      throw new InvalidConfigError(`Invalid configuration object - ${result.error}`, result.error.details[0]);
    }
    this.config = config;
  }

  extract() {
    const { baseURL, scrapeList } = this.config;
    const userAgent = generateRandomUserAgent();
    const options = {
      headers: {
        'User-Agent': userAgent
      }
    };

    const scrapePromises = scrapeList.map(
      scrapeDefinition => ScraperFactory(scrapeDefinition).scrape(baseURL, options)
    );
    return new Promise((resolve, reject) => {
      Promise.all(scrapePromises).then(results => resolve(formatResults(results)))
        .catch(err => reject(err)); // TODO treat error
    });
  }

}

module.exports = {
  Rattler
};
