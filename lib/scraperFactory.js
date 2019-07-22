const Loader = require('./loader');
const { getUrlForScrape } = require('./helpers');

class FollowNextScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  async scrape(baseURL, options) {
    const { searchURL, cssSelector, label } = this.scraperDefinition;
    const { cssSelector: followNextCssSelector, maxDepth } = this.scraperDefinition.followNext;
    let callCounter = 0;
    let nextURL;
    let url;
    const finalResult = [];

    while ((callCounter === 0 || nextURL !== undefined) && callCounter < maxDepth) {
      url = nextURL || getUrlForScrape(baseURL, searchURL);
      callCounter++;
      try {
        const $ = await Loader.loadPage(url, options);
        nextURL = $(followNextCssSelector).attr('href'); // TODO if link is relative won't work
        finalResult.push({
          extractedFrom: url,
          extractedWith: cssSelector,
          extractedInfo: $(cssSelector).text()
        });
      } catch (err) {
        nextURL = undefined; // this stops the loop as there is no nextURL
        finalResult.push({
          extractedFrom: url,
          extractedWith: cssSelector,
          error: {
            message: err.message,
            cause: err.cause
          }
        });
      }
    }
    return { [label]: finalResult };
  }

}

class SimpleScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  async scrape(baseURL, options) {
    const { searchURL, cssSelector, label } = this.scraperDefinition;
    const url = getUrlForScrape(baseURL, searchURL);
    const result = {
      [label]: {
        extractedFrom: url,
        extractedWith: cssSelector
      }
    };
    try {
      const $ = await Loader.loadPage(url, options);
      result[label].extractedInfo = $(cssSelector).text();
    } catch (err) {
      result[label].error = {
        message: err.message,
        cause: err.cause
      };
    }
    return result;
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
