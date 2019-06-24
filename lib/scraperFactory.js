const Loader = require('./loader');
const { NotImplementedError } = require('./errors');

class FollowNextScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  // eslint-disable-next-line class-methods-use-this
  async scrape(/* baseURL, options */) {
    throw new NotImplementedError('Follow Next Scraper is not yet implemented');
  }

}

class SimpleScraper {

  constructor(scraperDefinition) {
    this.scraperDefinition = scraperDefinition;
  }

  async scrape(baseURL, options) {
    const { searchURL, cssSelector } = this.scraperDefinition;
    const url = baseURL + searchURL;
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
