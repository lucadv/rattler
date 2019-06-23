const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Axios = require('axios');
const Sinon = require('sinon');
const { InvalidConfigError } = require('../lib/errors');
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

    it('should fail validation when missing baseURL', async () => {
      const config = {
        scrapeList: [{
          label: 'info-1',
          searchURL: '/abc',
          cssSelector: 'span'
        }]
      };
      const throws = () => new Rattler(config);
      const err = expect(throws).to.throw(InvalidConfigError,
        'Invalid configuration object - ValidationError: child "baseURL" fails because ["baseURL" is required]');
      expect(err.path).to.equal('baseURL');
      expect(err.context).to.equal({ key: 'baseURL', label: 'baseURL' });
    });

    it('should fail validation when missing scrapeList', async () => {
      const config = {
        baseURL: 'aaa'
      };
      const throws = () => new Rattler(config);
      const err = expect(throws).to.throw(InvalidConfigError,
        'Invalid configuration object - ValidationError: child "scrapeList" fails because ["scrapeList" is required]');
      expect(err.path).to.equal('scrapeList');
      expect(err.context).to.equal({ key: 'scrapeList', label: 'scrapeList' });
    });

    it('should fail validation when missing label inside scrapeList', async () => {
      const config = {
        baseURL: 'aaa',
        scrapeList: [{
          searchURL: 'bbb',
          cssSelector: 'span.my-class'
        }]
      };
      const throws = () => new Rattler(config);
      const err = expect(throws).to.throw(InvalidConfigError,
        'Invalid configuration object - ValidationError: child "scrapeList" fails because ["scrapeList" at '
        + 'position 0 fails because [child "label" fails because ["label" is required]]]');
      expect(err.path).to.equal('scrapeList.0.label');
      expect(err.context).to.equal({ key: 'label', label: 'label' });
    });

    it('should fail validation when missing searchURL inside scrapeList', async () => {
      const config = {
        baseURL: 'aaa',
        scrapeList: [{
          label: 'alabel',
          cssSelector: 'span.my-class'
        }]
      };
      const throws = () => new Rattler(config);
      const err = expect(throws).to.throw(InvalidConfigError,
        'Invalid configuration object - ValidationError: child "scrapeList" fails because ["scrapeList" at '
        + 'position 0 fails because [child "searchURL" fails because ["searchURL" is required]]]');
      expect(err.path).to.equal('scrapeList.0.searchURL');
      expect(err.context).to.equal({ key: 'searchURL', label: 'searchURL' });
    });

    it('should fail validation when missing cssSelector inside scrapeList', async () => {
      const config = {
        baseURL: 'aaa',
        scrapeList: [{
          label: 'alabel',
          searchURL: '/abc'
        }]
      };
      const throws = () => new Rattler(config);
      const err = expect(throws).to.throw(InvalidConfigError,
        'Invalid configuration object - ValidationError: child "scrapeList" fails because ["scrapeList" at '
        + 'position 0 fails because [child "cssSelector" fails because ["cssSelector" is required]]]');
      expect(err.path).to.equal('scrapeList.0.cssSelector');
      expect(err.context).to.equal({ key: 'cssSelector', label: 'cssSelector' });
    });
  });

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
            console.log('result', result);
            expect(result).to.exist();
            expect(result['info-1']).to.exist();
            expect(result['info-1'].extractedFrom).to.equal(baseURL + searchURL);
            expect(result['info-1'].extractedWith).to.equal('span.my-class');
            expect(result['info-1'].extractedInfo).to.equal('my text');
            expect(axiosSpy.callCount).to.equal(1);
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
      });

      describe('(with errors making the remote request)', () => {

        before(async () => {
          Sinon.stub(Axios, 'get').callsFake(async () => Promise.reject(new Error('BOOM')));
        });

        after(async () => {
          Axios.get.restore();
        });

        it('should reject with the error', async () => {

          const config = {
            baseURL,
            scrapeList: [{
              label: 'info-1',
              searchURL,
              cssSelector: 'span.my-class'
            }]
          };
          const rt = new Rattler(config);
          await expect(rt.extract()).to.reject(Error, 'BOOM');
        });
      });
    });
  });

});
