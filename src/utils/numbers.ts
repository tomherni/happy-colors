// @ts-nocheck

/**
 * Ensure a number does not exceed a minimum or maximum.
 * @param {Number} number
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function minMax(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

/**
 * Round a number to a maximum amount of decimals. Not the most precise in
 * regards to floating point/scaling, but will work fine for this project.
 * @param {Number} number
 * @param {Number} maxDecimals
 * @returns {Number}
 */
export function round(number, maxDecimals = 0) {
  return Number(number.toFixed(maxDecimals));
}

export const isNumber = value => typeof value === 'number';
