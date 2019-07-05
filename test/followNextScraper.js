const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Axios = require('axios');
const Sinon = require('sinon');
const FS = require('fs');
const Path = require('path');
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

        describe('(when all pages exists)', () => {

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

          it('should return the extracted text from all followed pages', async () => {
            const config = {
              baseURL,
              scrapeList: [{
                label: 'pages',
                searchURL,
                cssSelector: 'h1',
                followNext: {
                  cssSelector: '#nextLink',
                  maxDepth: 5
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
        });

        // TODO add test for selector not found

      });

      describe('(with errors)', () => {

        describe('(404 from one page)', () => {

          before(async () => {
            axiosSpy = Sinon.stub(Axios, 'get').callsFake(async (url) => {
              const page = url.split(`${baseURL}/`)[1];
              if (page === 'page-3') {
                const err = new Error('Request failed with status code 404');
                err.response = {
                  status: 404,
                  statusText: 'Not Found'
                };
                err.data = { statusCode: 404, error: 'Not Found', message: 'Not Found' };
                throw err;
              }
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

          it('should return the extracted text up to the page that failed', async () => {
            const config = {
              baseURL,
              scrapeList: [{
                label: 'pages',
                searchURL,
                cssSelector: 'h1',
                followNext: {
                  cssSelector: '#nextLink',
                  maxDepth: 5
                }
              }]
            };
            const rt = new Rattler(config);
            const res = await rt.extract();
            expect(res.pages).to.exist();
            // TODO brittle, if we add more pages this will fail
            expect(res.pages).to.have.length(3);
            expect(res.pages[0].extractedFrom).to.equal('http://www.example.com/page-1');
            expect(res.pages[0].extractedWith).to.equal('h1');
            expect(res.pages[0].extractedInfo).to.equal('Page 1');

            expect(res.pages[1].extractedFrom).to.equal('http://www.example.com/page-2');
            expect(res.pages[1].extractedWith).to.equal('h1');
            expect(res.pages[1].extractedInfo).to.equal('Page 2');

            expect(res.pages[2].extractedInfo).to.be.instanceof(Error);
          });

          it('should return the error in the extractedInfo of the page that failed', async () => {
            const config = {
              baseURL,
              scrapeList: [{
                label: 'pages',
                searchURL,
                cssSelector: 'h1',
                followNext: {
                  cssSelector: '#nextLink',
                  maxDepth: 5
                }
              }]
            };
            const rt = new Rattler(config);
            const res = await rt.extract();
            expect(res.pages).to.exist();
            // TODO brittle, if we add more pages this will fail
            expect(res.pages).to.have.length(3);

            expect(res.pages[2].extractedFrom).to.equal('http://www.example.com/page-3');
            expect(res.pages[2].extractedWith).to.equal('h1');
            expect(res.pages[2].extractedInfo).to.be.instanceof(Error);
            expect(res.pages[2].extractedInfo.message).to.equal('Response returned out of range status code');
            expect(res.pages[2].extractedInfo.statusCode).to.equal(404);
            expect(res.pages[2].extractedInfo.reason).to.equal({
              statusCode: 404,
              error: 'Not Found',
              message: 'Not Found'
            });
          });
        });
      });

    });
  });

});
