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

const html = FS.readFileSync(Path.join(__dirname, '../artifacts/page-1.html'), 'utf8');
const baseURL = 'http://my-server.com';
const searchURL = '/page-1.html';

describe('Rattler', () => {

  describe('e2e tests', () => {

    beforeEach(async () => {
      Nock('http://my-server.com')
        .get('/page-1.html')
        .reply(200, html);

      Nock('http://my-server.com')
        .get('/not-found')
        .reply(404, 'Not Found');
    });

    afterEach(async () => {
      Nock.cleanAll();
    });

    describe('extract', () => {

      describe('(single)', () => {

        it('should extract text in css selector path', async () => {
          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL,
              cssSelector: 'div.a-class p'
            }]
          };
          const rt = new Rattler(config);
          const result = await rt.extract();
          expect(result).to.exist();
          expect(result['info-1']).to.exist();
          expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
          expect(result['info-1'].extractedWith).to.equal('div.a-class p');
          expect(result['info-1'].extractedInfo).to.equal('Sed ut perspiciatis unde omnis iste natus error sit voluptatem');
        });

        it('extract should be empty if selector not found', async () => {
          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL,
              cssSelector: 'not-found'
            }]
          };
          const rt = new Rattler(config);
          const result = await rt.extract();
          expect(result).to.exist();
          expect(result['info-1']).to.exist();
          expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
          expect(result['info-1'].extractedWith).to.equal('not-found');
          expect(result['info-1'].extractedInfo).to.equal('');
        });

        it('extract should be empty if page not found', async () => {
          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL,
              cssSelector: 'not-found'
            }]
          };
          const rt = new Rattler(config);
          const result = await rt.extract();
          expect(result).to.exist();
          expect(result['info-1']).to.exist();
          expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
          expect(result['info-1'].extractedWith).to.equal('not-found');
          expect(result['info-1'].extractedInfo).to.equal('');
        });

        it('should return error in the results but not reject', async () => {
          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL: '/not-found',
              cssSelector: 'not-found'
            }]
          };
          const rt = new Rattler(config);
          const result = await rt.extract();
          expect(result).to.exist();
          expect(result['info-1']).to.exist();
          expect(result['info-1'].extractedFrom).to.equal(`${baseURL}/not-found`);
          expect(result['info-1'].extractedWith).to.equal('not-found');
          expect(result['info-1'].extractedInfo).to.not.exist();
          expect(result['info-1'].error).to.exist();
          expect(result['info-1'].error.message).to.equal('Response returned 404');
          expect(result['info-1'].error.cause).to.exist();
          expect(result['info-1'].error.cause.statusCode).to.equal(404);
          expect(result['info-1'].error.cause.error).to.equal('Not Found');
        });
      });
    });

  });

});
