import { expect } from '@open-wc/testing';
import { get } from '../objects.js';

describe('objects utils', () => {
  describe('get', () => {
    const obj = { bar: 'baz', deep: { deeper: { deepest: 'success' } } };

    it('should return a property', () => {
      expect(get(obj, 'bar')).to.equal('baz');
      expect(get(obj, 'deep.deeper')).to.deep.equal({ deepest: 'success' });
      expect(get(obj, 'deep.deeper.deepest')).to.equal('success');
    });

    it('should not crash for non-existing properties', () => {
      expect(() => get(obj, 'foo.bar.baz.some.thing')).to.not.throw();
      expect(() => get([], 'foo.bar.baz.some.thing')).to.not.throw();
      expect(() => get(undefined, 'foo.bar.baz.some.thing')).to.not.throw();
      expect(() => get(null, 'foo.bar.baz.some.thing')).to.not.throw();
    });

    it('should return "undefined" for non-existing properties', () => {
      expect(get(obj, 'foo.bar.baz.some.thing')).to.equal(undefined);
      expect(get([], 'foo.bar.baz.some.thing')).to.equal(undefined);
      expect(get(undefined, 'foo.bar.baz.some.thing')).to.equal(undefined);
      expect(get(null, 'foo.bar.baz.some.thing')).to.equal(undefined);
    });
  });
});
