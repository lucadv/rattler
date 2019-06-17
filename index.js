const Axios = require('axios');
const Cheerio = require('cheerio');

const generateRandomUserAgent = () => {
  // TODO get a more wider list of userAgents
  const userAgentList = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
  ];
  return userAgentList[Math.floor((Math.random() * 3))]
}

const getRealEstatesPrices = async (baseURL, searchURL, cssSelector) => {
  const userAgent = generateRandomUserAgent();
  const options = {
    url: searchURL,
    baseURL: baseURL,
    method: 'get',
    headers: {
      'User-Agent': userAgent
    }
  };
  const result = await Axios(options);
  const $ = Cheerio.load(result.data);
  const prices = $(cssSelector).text().split('€');
  // TODO the resulting array has his last record as an empty string
  return prices;
};

// TODO hardocded, set these values in a vault/env vars or whatever
const baseURL = 'https://www.idealista.com';
const searchURL = '/venta-viviendas/malaga/centro/la-victoria-conde-de-urena-gibralfaro/';
const cssSelector = 'span.item-price';

getRealEstatesPrices(baseURL, searchURL, cssSelector)
  .then(prices => console.log(`prices for ${searchURL}`, prices))
  .catch(err => console.log('err', err));