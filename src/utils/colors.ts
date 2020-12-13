/* eslint-disable no-param-reassign, default-case */

import { Hue, Hsv, Rgb, Hsl, Hex } from '../types.js';
import { minMax, round } from './numbers.js';

/**
 * Lot of logic for color conversions come from this URL (incorporated minor custom tweaks).
 * https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
 */

export function validateHue(hue: Hue): Hue {
  return minMax(round(hue, 2), 0, 360);
}

/**
 * Ensure a set of HSV values are valid. Also applicable to HSL values.
 * @param {Number[]} hsv
 * @returns {Number[]}
 */
export function validateHsv([h, s, v]: Hsv): Hsv {
  return [
    validateHue(h),
    minMax(round(s, 2), 0, 100),
    minMax(round(v, 2), 0, 100),
  ];
}

/**
 * Ensure a set of RGB values are valid.
 * @param {Number[]} rgb
 * @returns {Number[]}
 */
export function validateRgb(rgb: Rgb): Rgb {
  return rgb.map(value => minMax(round(value, 2), 0, 255)) as Rgb;
}

/**
 * Convert a set of HSV values to RGB.
 * @param {Number[]} hsv
 * @returns {Number[]}
 */
export function hsvToRgb([h, s, v]: Hsv): Hsv {
  h /= 360;
  s /= 100;
  v /= 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r;
  let g;
  let b;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  // @ts-ignore
  return validateRgb([r * 255, g * 255, b * 255]);
}

/**
 * Convert a set of HSV values to HSL.
 * @param {Number[]} hsv
 * @returns {Number[]}
 */
export function hsvToHsl([h, s, v]: Hsv): Hsl {
  s /= 100;
  v /= 100;

  let _s = s * v;
  let _l = (2 - s) * v;

  const foo = _l <= 1 ? _l : 2 - _l;
  _s = foo === 0 ? 0 : _s / foo;

  _l /= 2;

  return validateHsv([h, _s * 100, _l * 100]);
}

/**
 * Convert a set of RGB values to HEX.
 * @param {Number[]} rgb
 * @returns {String}
 */
export function rgbToHex(rgb: Rgb): Hex {
  return rgb
    .reduce((output, number) => {
      const hex = round(number).toString(16);
      return `${output}${hex.length === 1 ? `0${hex}` : hex}`;
    }, '')
    .toUpperCase();
}

export function hsvToHex(hsv: Hsv): Hex {
  return rgbToHex(hsvToRgb(hsv));
}

/**
 * Parse a set of RGB values as a usable CSS value.
 * @param {Number[]} rgb
 * @returns {String}
 */
export function rgbToCssString(rgb: Rgb): string {
  return `rgb(${rgb.join(',')})`;
}

/**
 * Check if a color changed by comparing it with its previous value.
 * @param {Array|undefined} value
 * @param {Array|undefined} previous
 * @returns {Boolean}
 */
export function hasColorChanged(
  value: number[] | undefined,
  previous: number[] | undefined
): boolean {
  return Array.isArray(value) && Array.isArray(previous)
    ? value.some((val, index) => val !== previous[index])
    : value !== previous;
}
