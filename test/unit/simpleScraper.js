const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Axios = require('axios');
const Cheerio = require('cheerio');
const Sinon = require('sinon');
const Rattler = require('../../');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const afterEach = lab.afterEach;
const expect = Code.expect;

describe('Rattler', () => {

  describe('unit tests', () => {

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

          describe('(single)', () => {

            it('should extract text in css selector path', async () => {
              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL,
                  cssSelector: 'span.my-class'
                }]
              };
              const rt = new Rattler(config);
              const result = await rt.extract();
              expect(result).to.exist();
              expect(result['info-1']).to.exist();
              expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
              expect(result['info-1'].extractedWith).to.equal('span.my-class');
              expect(result['info-1'].extractedInfo).to.equal('my text');
              expect(axiosSpy.callCount).to.equal(1);
            });
            // TODO COMPLETE TEST
            it.skip('should return null if the cssSelector does not match with any element', async () => {
              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL,
                  cssSelector: 'not-in-the-dom'
                }]
              };
              const rt = new Rattler(config);
              const result = await rt.extract();
              console.log(result);
            });

            // TODO add test for selector not found
          });

          describe('(multiple same page)', () => {

            it('should extract text from multiple selectors', async () => {
              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL,
                  cssSelector: 'span.my-class'
                }, {
                  label: 'info-2',
                  searchURL,
                  cssSelector: 'span.my-other-class'
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
              expect(axiosSpy.callCount).to.equal(2);
            });
          });

          describe('(multiple same page, searchURL not provided)', () => {
            it('should extract text from multiple selectors', async () => {
              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  cssSelector: 'span.my-class'
                }, {
                  label: 'info-2',
                  cssSelector: 'span.my-other-class'
                }]
              };
              const rt = new Rattler(config);
              const result = await rt.extract();
              expect(result).to.exist();
              expect(result['info-1']).to.exist();
              expect(result['info-1'].extractedFrom).to.equal(baseURL);
              expect(result['info-1'].extractedWith).to.equal('span.my-class');
              expect(result['info-1'].extractedInfo).to.equal('my text');
              expect(result['info-2']).to.exist();
              expect(result['info-2'].extractedFrom).to.equal(baseURL);
              expect(result['info-2'].extractedWith).to.equal('span.my-other-class');
              expect(result['info-2'].extractedInfo).to.equal('my other text');
              expect(axiosSpy.callCount).to.equal(2);
            });
          });

        });

        describe('(with errors)', () => {

          describe('(making the remote request)', () => {

            before(async () => {
              Sinon.stub(Axios, 'get').callsFake(async () => Promise.reject(new Error('BOOM')));
            });

            after(async () => {
              Axios.get.restore();
            });

            it('should return the error in the results', async () => {

              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL,
                  cssSelector: 'span.my-class'
                }]
              };
              const rt = new Rattler(config);
              const res = await rt.extract();
              expect(res['info-1']).to.exist();
              expect(res['info-1'].extractedFrom).to.equal(baseURL + searchURL);
              expect(res['info-1'].extractedWith).to.equal('span.my-class');
              expect(res['info-1'].error).to.exist();
              expect(res['info-1'].error.message).to.exist('A request could not be made due to: BOOM');
              expect(res['info-1'].error.cause).to.be.an.instanceof(Error);
            });
          });

          describe('(loading the DOM)', () => {

            let cheerioSpy;

            before(async () => {
              axiosSpy = Sinon.stub(Axios, 'get').callsFake(async () => ({ data: html }));
              cheerioSpy = Sinon.stub(Cheerio, 'load').throws(new Error('boom'));
            });

            after(async () => {
              Axios.get.restore();
              Cheerio.load.restore();
            });

            it('should not reject and return result with the error', async () => {
              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL,
                  cssSelector: 'span.my-class'
                }]
              };
              const rt = new Rattler(config);
              const res = await rt.extract();
              expect(res['info-1']).to.exist();
              expect(res['info-1'].extractedFrom).to.equal(baseURL + searchURL);
              expect(res['info-1'].extractedWith).to.equal('span.my-class');
              expect(res['info-1'].error).to.exist();
              expect(res['info-1'].error.message).to.exist(`Could not load DOM for url ${baseURL + searchURL}`);
              expect(res['info-1'].error.cause).to.be.an.instanceof(Error);
              expect(cheerioSpy.calledOnce).to.be.true();
            });
          });
        });

      });
    });
  });


});
