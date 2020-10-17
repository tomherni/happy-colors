import { expect } from '@open-wc/testing';
import * as colors from '../colors.js';

describe('colors utils', () => {
  describe('function rgbToCssString()', () => {
    it('should convert an RGB set to a CSS value', () => {
      expect(colors.rgbToCssString([12, 34, 56])).to.equal('rgb(12,34,56)');
    });
  });

  describe('color value validations', () => {
    it('should validate a hue', () => {
      expect(colors.validateHue(-1)).to.equal(0);
      expect(colors.validateHue(0)).to.equal(0);
      expect(colors.validateHue(0.5)).to.equal(0.5);
      expect(colors.validateHue(123)).to.equal(123);
      expect(colors.validateHue(359.5)).to.equal(359.5);
      expect(colors.validateHue(360)).to.equal(360);
      expect(colors.validateHue(361)).to.equal(360);
    });

    it('should validate an HSV', () => {
      expect(colors.validateHsv([-1, -1, -1])).to.deep.equal([0, 0, 0]);
      expect(colors.validateHsv([123, 45, 67])).to.deep.equal([123, 45, 67]);
      expect(colors.validateHsv([360.4, 100.5, 101])).to.deep.equal([
        360,
        100,
        100,
      ]);
    });

    it('should validate an RGB', () => {
      expect(colors.validateRgb([-1, -1, -1])).to.deep.equal([0, 0, 0]);
      expect(colors.validateRgb([123, 45, 67])).to.deep.equal([123, 45, 67]);
      expect(colors.validateRgb([255.4, 255.5, 256])).to.deep.equal([
        255,
        255,
        255,
      ]);
    });
  });

  describe('color conversions', () => {
    it('should convert HSV to RGB', () => {
      // Maximum RGB variants
      expect(colors.hsvToRgb([0, 100, 100])).to.deep.equal([255, 0, 0]);
      expect(colors.hsvToRgb([360, 100, 100])).to.deep.equal([255, 0, 0]);
      expect(colors.hsvToRgb([60, 100, 100])).to.deep.equal([255, 255, 0]);
      expect(colors.hsvToRgb([120, 100, 100])).to.deep.equal([0, 255, 0]);
      expect(colors.hsvToRgb([180, 100, 100])).to.deep.equal([0, 255, 255]);
      expect(colors.hsvToRgb([240, 100, 100])).to.deep.equal([0, 0, 255]);
      expect(colors.hsvToRgb([300, 100, 100])).to.deep.equal([255, 0, 255]);

      // Boundaries
      expect(colors.hsvToRgb([0, 0, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToRgb([0, 100, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToRgb([0, 0, 100])).to.deep.equal([255, 255, 255]);
      expect(colors.hsvToRgb([0, 100, 100])).to.deep.equal([255, 0, 0]);
      expect(colors.hsvToRgb([360, 0, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToRgb([360, 100, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToRgb([360, 0, 100])).to.deep.equal([255, 255, 255]);
      expect(colors.hsvToRgb([360, 100, 100])).to.deep.equal([255, 0, 0]);

      // Mixed
      expect(colors.hsvToRgb([123, 0, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToRgb([1, 1, 1])).to.deep.equal([2.55, 2.52, 2.52]);
      expect(colors.hsvToRgb([24, 2, 89])).to.deep.equal([
        226.95,
        224.23,
        222.41,
      ]);
      expect(colors.hsvToRgb([88, 61, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToRgb([109, 100, 60])).to.deep.equal([28.05, 153, 0]);
      expect(colors.hsvToRgb([123, 45, 67])).to.deep.equal([
        93.97,
        170.85,
        97.81,
      ]);
      expect(colors.hsvToRgb([144, 100, 33])).to.deep.equal([0, 84.15, 33.66]);
      expect(colors.hsvToRgb([199, 12, 100])).to.deep.equal([
        224.4,
        245.31,
        255,
      ]);
      expect(colors.hsvToRgb([217, 100, 54])).to.deep.equal([0, 52.79, 137.7]);
      expect(colors.hsvToRgb([241, 31, 28])).to.deep.equal([
        49.63,
        49.27,
        71.4,
      ]);
      expect(colors.hsvToRgb([275, 0, 28])).to.deep.equal([71.4, 71.4, 71.4]);
      expect(colors.hsvToRgb([313, 99, 12])).to.deep.equal([30.6, 0.31, 24.04]);
      expect(colors.hsvToRgb([345, 0, 43])).to.deep.equal([
        109.65,
        109.65,
        109.65,
      ]);
      expect(colors.hsvToRgb([350, 71, 100])).to.deep.equal([
        255,
        73.95,
        104.13,
      ]);
    });

    it('should convert HSV to HSL', () => {
      // Boundaries
      expect(colors.hsvToHsl([0, 0, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToHsl([0, 100, 0])).to.deep.equal([0, 0, 0]);
      expect(colors.hsvToHsl([0, 0, 100])).to.deep.equal([0, 0, 100]);
      expect(colors.hsvToHsl([0, 100, 100])).to.deep.equal([0, 100, 50]);
      expect(colors.hsvToHsl([360, 0, 0])).to.deep.equal([360, 0, 0]);
      expect(colors.hsvToHsl([360, 100, 0])).to.deep.equal([360, 0, 0]);
      expect(colors.hsvToHsl([360, 0, 100])).to.deep.equal([360, 0, 100]);
      expect(colors.hsvToHsl([360, 100, 100])).to.deep.equal([360, 100, 50]);

      // Mixed
      expect(colors.hsvToHsl([4, 0, 100])).to.deep.equal([4, 0, 100]);
      expect(colors.hsvToHsl([18, 19, 0])).to.deep.equal([18, 0, 0]);
      expect(colors.hsvToHsl([49, 100, 31])).to.deep.equal([49, 100, 15.5]);
      expect(colors.hsvToHsl([60, 40, 100])).to.deep.equal([60, 100, 80]);
      expect(colors.hsvToHsl([80, 0, 100])).to.deep.equal([80, 0, 100]);
      expect(colors.hsvToHsl([101, 83, 100])).to.deep.equal([101, 100, 58.5]);
      expect(colors.hsvToHsl([167, 0, 54])).to.deep.equal([167, 0, 54]);
      expect(colors.hsvToHsl([199, 44, 100])).to.deep.equal([199, 100, 78]);
      expect(colors.hsvToHsl([226, 60, 91])).to.deep.equal([226, 75.21, 63.7]);
      expect(colors.hsvToHsl([277, 74, 2])).to.deep.equal([277, 58.73, 1.26]);
      expect(colors.hsvToHsl([333, 80, 98])).to.deep.equal([333, 95.15, 58.8]);
    });

    it('should convert RGB to HEX', () => {
      // Maximum RGB variants
      expect(colors.rgbToHex([255, 0, 0])).to.equal('FF0000');
      expect(colors.rgbToHex([255, 255, 0])).to.equal('FFFF00');
      expect(colors.rgbToHex([0, 255, 0])).to.equal('00FF00');
      expect(colors.rgbToHex([0, 255, 255])).to.equal('00FFFF');
      expect(colors.rgbToHex([0, 0, 255])).to.equal('0000FF');
      expect(colors.rgbToHex([255, 0, 255])).to.equal('FF00FF');

      // Boundaries (other than the ones above)
      expect(colors.rgbToHex([0, 0, 0])).to.equal('000000');
      expect(colors.rgbToHex([255, 255, 255])).to.equal('FFFFFF');

      // Mixed
      expect(colors.rgbToHex([0, 13, 242])).to.equal('000DF2');
      expect(colors.rgbToHex([1, 1, 1])).to.equal('010101');
      expect(colors.rgbToHex([12, 34, 56])).to.equal('0C2238');
      expect(colors.rgbToHex([50, 0, 111])).to.equal('32006F');
      expect(colors.rgbToHex([98, 150, 0])).to.equal('629600');
      expect(colors.rgbToHex([120, 222, 67])).to.equal('78DE43');
      expect(colors.rgbToHex([213, 77, 230])).to.equal('D54DE6');
      expect(colors.rgbToHex([254, 254, 254])).to.equal('FEFEFE');
    });

    it('should convert HSV to HEX', () => {
      // Maximum RGB variants
      expect(colors.hsvToHex([0, 100, 100])).to.deep.equal('FF0000');
      expect(colors.hsvToHex([360, 100, 100])).to.deep.equal('FF0000');
      expect(colors.hsvToHex([60, 100, 100])).to.deep.equal('FFFF00');
      expect(colors.hsvToHex([120, 100, 100])).to.deep.equal('00FF00');
      expect(colors.hsvToHex([180, 100, 100])).to.deep.equal('00FFFF');
      expect(colors.hsvToHex([240, 100, 100])).to.deep.equal('0000FF');
      expect(colors.hsvToHex([300, 100, 100])).to.deep.equal('FF00FF');

      // Boundaries
      expect(colors.hsvToHex([0, 0, 0])).to.deep.equal('000000');
      expect(colors.hsvToHex([0, 100, 0])).to.deep.equal('000000');
      expect(colors.hsvToHex([0, 0, 100])).to.deep.equal('FFFFFF');
      expect(colors.hsvToHex([0, 100, 100])).to.deep.equal('FF0000');
      expect(colors.hsvToHex([360, 0, 0])).to.deep.equal('000000');
      expect(colors.hsvToHex([360, 100, 0])).to.deep.equal('000000');
      expect(colors.hsvToHex([360, 0, 100])).to.deep.equal('FFFFFF');
      expect(colors.hsvToHex([360, 100, 100])).to.deep.equal('FF0000');

      // Mixed
      expect(colors.hsvToHex([123, 0, 0])).to.deep.equal('000000');
      expect(colors.hsvToHex([1, 1, 1])).to.deep.equal('030303');
      expect(colors.hsvToHex([24, 2, 89])).to.deep.equal('E3E0DE');
      expect(colors.hsvToHex([88, 61, 0])).to.deep.equal('000000');
      expect(colors.hsvToHex([109, 100, 60])).to.deep.equal('1C9900');
      expect(colors.hsvToHex([123, 45, 67])).to.deep.equal('5EAB62');
      expect(colors.hsvToHex([144, 100, 33])).to.deep.equal('005422');
      expect(colors.hsvToHex([199, 12, 100])).to.deep.equal('E0F5FF');
      expect(colors.hsvToHex([217, 100, 54])).to.deep.equal('00358A');
      expect(colors.hsvToHex([241, 31, 28])).to.deep.equal('323147');
      expect(colors.hsvToHex([275, 0, 28])).to.deep.equal('474747');
      expect(colors.hsvToHex([313, 99, 12])).to.deep.equal('1F0018');
      expect(colors.hsvToHex([345, 0, 43])).to.deep.equal('6E6E6E');
      expect(colors.hsvToHex([350, 71, 100])).to.deep.equal('FF4A68');
    });
  });
});
