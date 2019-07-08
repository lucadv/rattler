const Async = require('async');
const Loader = require('./loader');
const { getUrlForScrape } = require('./helpers');

class FollowNextScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  // eslint-disable-next-line class-methods-use-this
  scrape(baseURL, options) {
    const { searchURL, cssSelector, label } = this.scraperDefinition;
    const { cssSelector: followNextCssSelector, maxDepth } = this.scraperDefinition.followNext;
    let callCounter = 0;
    let nextURL;
    let url;
    const finalResult = [];

    return new Promise((resolve) => {
      Async.whilst(
        async function test() {
          return (callCounter === 0 || nextURL !== undefined)
            && callCounter < maxDepth;
        },
        async function scrapePageAndGrabNext() {
          url = nextURL || getUrlForScrape(baseURL, searchURL);
          callCounter++;

          return Loader.loadPage(url, options).then(($) => {
            nextURL = $(followNextCssSelector).attr('href'); // TODO if link is relative won't work
            return finalResult.push({
              extractedFrom: url,
              extractedWith: cssSelector,
              extractedInfo: $(cssSelector).text()
            });
          }).catch((err) => {
            nextURL = undefined; // this stops the loop as there is no nextURL
            finalResult.push({
              extractedFrom: url,
              extractedWith: cssSelector,
              error: {
                message: err.message,
                cause: err.cause
              }
            });
          });

        },
        function result() {
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
