const Axios = require('axios');
const Cheerio = require('cheerio');
const {
  ResponseError,
  RequestError,
  DOMLoaderError
} = require('./errors');

async function loadPage(url, options) {
  let data;
  try {
    const response = await Axios.get(url, options);
    data = response.data;
  } catch (err) {
    if (err.response) {
      throw new ResponseError('Response returned out of range status code', err.response.status, err.data);
    }
    throw new RequestError(`A request could not be made due to: ${err.message}`, err);
  }
  try {
    return Cheerio.load(data);
  } catch (err) {
    throw new DOMLoaderError(`Could not load DOM for url ${url}`, err);
  }
}

module.exports = {
  loadPage
};
