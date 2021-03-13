/**
 * Ensure a number does not exceed a minimum or maximum.
 * @param {Number} number
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function minMax(number: number, min: number, max: number): number {
  return Math.min(Math.max(number, min), max);
}

/**
 * Round a number to a maximum amount of decimals. Not the most precise in
 * regards to floating point/scaling, but will work fine for this project.
 * @param {Number} number
 * @param {Number} maxDecimals
 * @returns {Number}
 */
export function round(number: number, maxDecimals = 0): number {
  return Number(number.toFixed(maxDecimals));
}

export function roundPercentage(value: number): number {
  return round(minMax(value, 0, 100), 2);
}

/**
 * Simple check whether a given value is a number.
 * @param {*} value
 * @returns {Boolean}
 */
export function isNumber(value: unknown): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}
