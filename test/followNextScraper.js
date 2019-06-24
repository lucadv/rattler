const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Axios = require('axios');
const Sinon = require('sinon');
const { NotImplementedError } = require('../lib/errors');
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

  describe('(with valid config)', () => {

    describe('extract', () => {

      const baseURL = 'http://www.example.com';
      const searchURL = '/endpoint';
      let axiosSpy;
      const html = '<html><body><span class="my-class">my text</span><span class="my-other-class">my other text</span></body></html>';

      describe('(with no errors)', () => {

        before(async () => {
          axiosSpy = Sinon.stub(Axios, 'get').callsFake(async () => ({ data: html }));
        });

        after(async () => {
          Axios.get.restore();
        });

        afterEach(async () => {
          axiosSpy.resetHistory();
        });

        describe('(followNext)', () => {

          it('should return the extracted text from all the pagination links', async () => {
            const config = {
              baseURL,
              scrapeList: [{
                label: 'info-1',
                searchURL,
                cssSelector: 'span.my-class',
                followNext: {
                  cssSelector: 'div.pagination.ul.li.next'
                }
              }]
            };
            const rt = new Rattler(config);
            await expect(rt.extract()).to.reject(NotImplementedError, 'Follow Next Scraper is not yet implemented');
          });

          // TODO add test for selector not found
        });

      });

    });
  });

});
