const Async = require('async');
const Loader = require('./loader');
const { NotImplementedError } = require('./errors');
const { getUrlForScrape } = require('./helpers');

class FollowNextScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  // eslint-disable-next-line class-methods-use-this
  scrape(baseURL, options) {
    const { searchURL, cssSelector } = this.scraperDefinition;
    const followNextCssSelector = this.scraperDefinition.followNext.cssSelector;
    let callCounter = 0;
    let nextURL;
    let url;

    return new Promise((resolve, reject) => {
      Async.whilst(
        async function test() {
          return callCounter === 0 || nextURL !== undefined;
        },
        async function scrapePageAndGrabNext() {
          url = nextURL || getUrlForScrape(baseURL, searchURL);
          callCounter++;
          const $ = await Loader.loadPage(url, options);
          nextURL = $(followNextCssSelector).find('a').attr('href');
          console.log('followNextCssSelector', followNextCssSelector);
          console.log('nextUrl', nextURL);
          return {
            extractedFrom: url,
            extractedWith: cssSelector,
            extractedInfo: $(cssSelector).text()
          };
        },
        function result(err, res) {
          console.log('err', err);
          console.log('res', res);
          if (err) {
            return reject(err);
          }
          resolve(res);
        }
      );
    });
    
  }

}

class SimpleScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  async scrape(baseURL, options) {
    const { searchURL, cssSelector } = this.scraperDefinition;
    const url = getUrlForScrape(baseURL, searchURL);
    const $ = await Loader.loadPage(url, options);
    return {
      [this.scraperDefinition.label]: {
        extractedFrom: url,
        extractedWith: cssSelector,
        extractedInfo: $(cssSelector).text()
      }
    };
  }
}


const scraperFactory = (scraperDefinition) => {
  if (scraperDefinition.followNext) {
    // TODO implement
    return new FollowNextScraper(scraperDefinition);
  }
  return new SimpleScraper(scraperDefinition);
};

module.exports = scraperFactory;
