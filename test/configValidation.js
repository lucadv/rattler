const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { InvalidConfigError } = require('../lib/errors');
const Rattler = require('../');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
// const before = lab.before;
// const after = lab.after;
// const afterEach = lab.afterEach;
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

});
