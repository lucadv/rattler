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
const afterEach = lab.afterEach;
const expect = Code.expect;

describe('Rattler', () => {

  describe('(with invalid config)', () => {
    // TODO implement tests

  });

  describe('(with valid config)', () => {

    describe('extract', () => {

      const baseURL = 'http://www.example.com';
      const searchURL = '/endpoint';
      let axiosSpy;

      describe('(single)', () => {

        const html = '<html><body><span class="my-class">my text</span></body></html>';

        before(async () => {
          axiosSpy = Sinon.stub(Axios, 'get').callsFake(async () => ({ data: html }));
        });

        after(async () => {
          Axios.get.restore();
        });

        afterEach(async () => {
          axiosSpy.resetHistory();
        });

        it('should extract text in css selector path', async () => {
          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL: searchURL,
              path: 'span.my-class'
            }]
          };
          const rt = new Rattler(config);
          const result = await rt.extract();
          expect(result).to.exist();
          expect(result['info-1']).to.exist();
          expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
          expect(result['info-1'].extractedWith).to.equal('span.my-class');
          expect(result['info-1'].extractedInfo).to.equal('my text');
          expect(rt.stats.total_requests).to.equal(1);
        });

        // TODO add test for selector not found
      });

      describe('(multiple same page)', () => {

        const html = '<html><body><span class="my-class">my text</span><span class="my-other-class">my other text</span></body></html>';

        before(async () => {
          axiosSpy = Sinon.stub(Axios, 'get').callsFake(async () => ({ data: html }));
        });

        after(async () => {
          Axios.get.restore();
        });

        afterEach(async () => {
          axiosSpy.resetHistory();
        });

        it('should extract text from multiple selectors', async () => {
          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL: searchURL,
              path: 'span.my-class'
            }, {
              label: 'info-2',
              searchURL: searchURL,
              path: 'span.my-other-class'
            }]
          };
          const rt = new Rattler(config);
          const result = await rt.extract();
          expect(result).to.exist();
          expect(result['info-1']).to.exist();
          expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
          expect(result['info-1'].extractedWith).to.equal('span.my-class');
          expect(result['info-1'].extractedInfo).to.equal('my text');
          expect(result['info-2']).to.exist();
          expect(result['info-2'].extractedFrom).to.equal(baseURL + searchURL);
          expect(result['info-2'].extractedWith).to.equal('span.my-other-class');
          expect(result['info-2'].extractedInfo).to.equal('my other text');
          expect(rt.stats.total_requests).to.equal(1);
        });
      });

    });
  });

});
