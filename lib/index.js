const Axios = require('axios');
const Cheerio = require('cheerio');

const { generateRandomUserAgent } = require('./helpers');

class Rattler {
  
  constructor(config) {
    // TODO Implement config validation
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