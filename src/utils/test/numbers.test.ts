// @ts-nocheck

import { expect } from '@open-wc/testing';
import { minMax, round } from '../numbers.js';

describe('numbers utils', () => {
  describe('function minMax()', () => {
    it('should return a value that does not exceed a minimum or maximum', () => {
      [-1.1, -1, 0, 0.1, 0.9, 1].forEach(value =>
        expect(minMax(value, 1, 5)).to.equal(1)
      );
      [5, 5.1, 6].forEach(value => expect(minMax(value, 1, 5)).to.equal(5));
    });

    it('should return the original value when it is between the minimum and maximum', () => {
      expect(minMax(1, 1, 10)).to.equal(1);
      expect(minMax(5, 1, 10)).to.equal(5);
      expect(minMax(10, 1, 10)).to.equal(10);
      expect(minMax(5.123456789, 1, 10)).to.equal(5.123456789);
    });
  });

  describe('function round()', () => {
    it('should completely round numbers by default', () => {
      expect(round(1.05)).to.equal(1);
      expect(round(1.4)).to.equal(1);
      expect(round(1.5)).to.equal(2);
      expect(round(1.9)).to.equal(2);
    });

    it('should round to numbers with decimals', () => {
      expect(round(1.05, 1)).to.equal(1.1);
      expect(round(1.4, 1)).to.equal(1.4);
      expect(round(1.49, 1)).to.equal(1.5);
      expect(round(1.5, 1)).to.equal(1.5);
      expect(round(1.49, 2)).to.equal(1.49);
      expect(round(1.5, 2)).to.equal(1.5);
    });
  });
});
