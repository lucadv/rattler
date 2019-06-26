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

          it.only('should return the extracted text from all the pagination links', async () => {
            const config = {
              baseURL,
              scrapeList: [{
                label: 'pages',
                searchURL,
                cssSelector: 'h1',
                followNext: {
                  cssSelector: 'pagination.next'
                }
              }]
            };
            const rt = new Rattler(config);
            const res = rt.extract();
            console.log('test result', res);
          });

          // TODO add test for selector not found
        });

      });

    });
  });

});
