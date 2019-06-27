const Async = require('async');
const Loader = require('./loader');
const { getUrlForScrape } = require('./helpers');

const MAX_FOLLOW_NEXT_REQUESTS = process.env.MAX_FOLLOW_NEXT_REQUESTS || 20;

class FollowNextScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  // eslint-disable-next-line class-methods-use-this
  scrape(baseURL, options) {
    const { searchURL, cssSelector, label } = this.scraperDefinition;
    const followNextCssSelector = this.scraperDefinition.followNext.cssSelector;
    let callCounter = 0;
    let nextURL;
    let url;
    const finalResult = [];

    return new Promise((resolve, reject) => {
      Async.whilst(
        async function test() {
          return (callCounter === 0 || nextURL !== undefined)
            && callCounter < MAX_FOLLOW_NEXT_REQUESTS;
        },
        async function scrapePageAndGrabNext() {
          url = nextURL || getUrlForScrape(baseURL, searchURL);
          callCounter++;
          const $ = await Loader.loadPage(url, options);
          nextURL = $(followNextCssSelector).attr('href'); // TODO if link is relative won't work
          finalResult.push({
            extractedFrom: url,
            extractedWith: cssSelector,
            extractedInfo: $(cssSelector).text()
          });
        },
        function result(err) {
          if (err) {
            return reject(err);
          }
          resolve({ [label]: finalResult });
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
