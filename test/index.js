const Lab = require('lab');
const Code = require('code');
const Axios = require('axios');
const Sinon = require('sinon');

const Rattler = require('../');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

describe('Rattler', () => {

  describe('getText', () => {

    const baseURL = 'http://www.example.com';
    const searchURL = '/endpoint';
    const html = '<html><body><span class="my-class">my text</span></body></html>'
    let axiosSpy;

    before(async () => {
      axiosSpy = Sinon.stub(Axios, 'get').callsFake(async () => ({ data: html }))
    });

    after(async () => {
      Axios.get.restore();
    });

    it('should get text in css selector path', async () => {
      const config = {
        baseURL: baseURL,
        searchURL: searchURL,
        cssSelector: 'span.my-class'
      };
      const rt = new Rattler(config);
      const text = await rt.getText();
      expect(text).to.equal('my text');
    });

  });
});