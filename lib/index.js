const Axios = require('axios');
const Cheerio = require('cheerio');
const Joi = require('@hapi/joi');

const { InvalidConfigError } = require('./errors');
const { generateRandomUserAgent } = require('./helpers');
const Schema = require('./configSchema');

const scrapeSingle = async (baseURL, scrapeDefinition, options) => {
  const { searchURL, cssSelector } = scrapeDefinition;
  const url = baseURL + searchURL;
  const { data } = await Axios.get(url, options);
  const $ = Cheerio.load(data);
  return {
    [scrapeDefinition.label]: {
      extractedFrom: url,
      extractedWith: cssSelector,
      extractedInfo: $(cssSelector).text()
    }
  };
};

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
    const result = Joi.validate(config.scrapeList, Schema);
    if (result.error) {
      throw new InvalidConfigError(`Invalid configuration object - ${result.error}`, result.error);
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
      scrapeDefinition => scrapeSingle(baseURL, scrapeDefinition, options)
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
