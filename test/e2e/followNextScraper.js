const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const FS = require('fs');
const Path = require('path');
const Nock = require('nock');

const Rattler = require('../../');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
// const before = lab.before;
const beforeEach = lab.beforeEach;
// const after = lab.after;
const afterEach = lab.afterEach;
const expect = Code.expect;

const pages = [
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-1.html'), 'utf8'),
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-2.html'), 'utf8'),
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-3.html'), 'utf8'),
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-4.html'), 'utf8'),
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-5.html'), 'utf8'),
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-6.html'), 'utf8'),
  FS.readFileSync(Path.join(__dirname, '../artifacts/page-7.html'), 'utf8')
];
const baseURL = 'http://www.example.com';

describe('Rattler', () => {

  describe('e2e tests', () => {

    describe('extract', () => {

      describe('(followNext scraper)', () => {

        describe('(single)', () => {

          describe('happy path', () => {

            beforeEach(async () => {
              Nock('http://www.example.com')
                .get('/page-1')
                .reply(200, pages[0]);

              Nock('http://www.example.com')
                .get('/page-2')
                .reply(200, pages[1]);

              Nock('http://www.example.com')
                .get('/page-3')
                .reply(200, pages[2]);

              Nock('http://www.example.com')
                .get('/page-4')
                .reply(200, pages[3]);

              Nock('http://www.example.com')
                .get('/page-5')
                .reply(200, pages[4]);

              Nock('http://www.example.com')
                .get('/page-6')
                .reply(200, pages[5]);

              Nock('http://www.example.com')
                .get('/page-7')
                .reply(200, pages[6]);
            });

            afterEach(async () => {
              Nock.cleanAll();
            });

            describe('starting from first', () => {

              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL: '/page-1',
                  cssSelector: 'div.a-class p',
                  followNext: {
                    cssSelector: '#nextLink',
                    maxDepth: 5
                  }
                }]
              };


              it('should extract from all available next pages', async () => {
                const rt = new Rattler(config);
                const result = await rt.extract();
                expect(result['info-1']).to.exist();
                expect(result['info-1']).to.have.length(5);
              });

              it('should extract from different pages', async () => {
                const rt = new Rattler(config);
                const result = await rt.extract();
                for (let i = 0; i < result['info-1'].length; i++) {
                  expect(result['info-1'][i].extractedFrom).to.equal(`${baseURL}/page-${i + 1}`);
                }
              });

              it('should extract all pages using the same cssSelector', async () => {
                const rt = new Rattler(config);
                const result = await rt.extract();
                for (let i = 0; i < result['info-1'].length; i++) {
                  expect(result['info-1'][i].extractedWith).to.equal('div.a-class p');
                }
              });

              it('should extract correct info in the respective page', async () => {
                const rt = new Rattler(config);
                const result = await rt.extract();
                expect(result['info-1'][0].extractedInfo).to.equal('Sed ut perspiciatis unde omnis iste natus error sit voluptatem');
                expect(result['info-1'][1].extractedInfo).to.equal('Ea natum brute patrioque usu, homero phaedrum referrentur ex sea');
                expect(result['info-1'][2].extractedInfo).to.equal('Cum ad prompta explicari vituperata, ei homero');
                expect(result['info-1'][3].extractedInfo).to.equal('Et ignota tamquam recteque est.');
                expect(result['info-1'][4].extractedInfo).to.equal('Cum modus iusto intellegat an, erant soleat an vix. Eu tempor oporteat mei');
              });
            });

            describe('starting from last page', () => {

              it('should extract only from the last page', async () => {
                const config = {
                  baseURL,
                  scrapeList: [{
                    label: 'info-1',
                    searchURL: '/page-7',
                    cssSelector: 'div.a-class p',
                    followNext: {
                      cssSelector: '#nextLink',
                      maxDepth: 5
                    }
                  }]
                };
                const rt = new Rattler(config);
                const result = await rt.extract();
                expect(result['info-1']).to.have.length(1);
                expect(result['info-1'][0]).to.equal({
                  extractedFrom: 'http://www.example.com/page-7',
                  extractedWith: 'div.a-class p',
                  extractedInfo: 'Cum modus iusto intellegat an, erant soleat an vix. Eu tempor oporteat mei'
                });
              });
            });
          });

          describe('with errors in some page', () => {

            beforeEach(async () => {
              Nock('http://www.example.com')
                .get('/page-1')
                .reply(200, pages[0]);

              Nock('http://www.example.com')
                .get('/page-2')
                .reply(200, pages[1]);

              Nock('http://www.example.com')
                .get('/page-3')
                .reply(404, 'Not Found Sorry');

              Nock('http://www.example.com')
                .get('/page-4')
                .reply(200, pages[3]);

              Nock('http://www.example.com')
                .get('/page-5')
                .reply(404, 'Not Found Sorry');
            });

            afterEach(async () => {
              Nock.cleanAll();
            });

            it('should stop in the page that returned error', async () => {
              const config = {
                baseURL,
                scrapeList: [{
                  label: 'info-1',
                  searchURL: '/page-1',
                  cssSelector: 'div.a-class p',
                  followNext: {
                    cssSelector: '#nextLink',
                    maxDepth: 5
                  }
                }]
              };
              const rt = new Rattler(config);
              const result = await rt.extract();
              expect(result['info-1']).to.have.length(3);
              expect(result['info-1'][0]).to.equal({
                extractedFrom: 'http://www.example.com/page-1',
                extractedWith: 'div.a-class p',
                extractedInfo: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem'
              });
              expect(result['info-1'][1]).to.equal({
                extractedFrom: 'http://www.example.com/page-2',
                extractedWith: 'div.a-class p',
                extractedInfo: 'Ea natum brute patrioque usu, homero phaedrum referrentur ex sea'
              });
              expect(result['info-1'][2]).to.equal({
                extractedFrom: 'http://www.example.com/page-3',
                extractedWith: 'div.a-class p',
                error: {
                  message: 'Response returned 404',
                  cause: {
                    statusCode: 404,
                    error: 'Not Found Sorry'
                  }
                }
              });
            });
          });

        });

      });


    });

  });

});
