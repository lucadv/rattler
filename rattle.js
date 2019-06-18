const { Rattler } = require('./lib');

const config = {
  baseURL: process.env.BASE_URL,
  searchURL: process.env.SEARCH_URL,
  cssSelector: process.env.CSS_SELECTOR
};

const rt = new Rattler(config);

rt.getText()
  .then(content => console.log('content', content))
  .catch(err => console.log('err', err));