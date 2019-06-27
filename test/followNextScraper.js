const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Axios = require('axios');
const Sinon = require('sinon');
const FS = require('fs');
const Path = require('path')
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
      const searchURL = '/page-1';
      let axiosSpy;
      describe('(with no errors)', () => {

        before(async () => {
          axiosSpy = Sinon.stub(Axios, 'get').callsFake(async (url) => {
            const page = url.split(`${baseURL}/`)[1];
            const html = FS.readFileSync(Path.join(__dirname, `/artifacts/${page}.html`), 'utf8');
            return {
              data: html
            };
          });
        });

        after(async () => {
          Axios.get.restore();
        });

        afterEach(async () => {
          axiosSpy.resetHistory();
        });

        describe('(followNext)', () => {

          it('should return the extracted text from all followed pages', async () => {
            const config = {
              baseURL,
              scrapeList: [{
                label: 'pages',
                searchURL,
                cssSelector: 'h1',
                followNext: {
                  cssSelector: '#nextLink'
                }
              }]
            };
            const rt = new Rattler(config);
            const res = await rt.extract();
            expect(res.pages).to.exist();
            // TODO brittle, if we add more pages this will fail
            expect(res.pages).to.have.length(5);
            for (let i = 0; i < res.pages.length; i++) {
              expect(res.pages[i].extractedFrom).to.equal(`http://www.example.com/page-${i + 1}`);
              expect(res.pages[i].extractedWith).to.equal('h1');
              expect(res.pages[i].extractedInfo).to.equal(`Page ${i + 1}`);
            }
          });

          // TODO add test for selector not found
        });

      });

    });
  });

});
