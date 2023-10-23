/**
 * Ensure a number does not exceed a minimum or maximum.
 */
export function minMax(number: number, min: number, max: number): number {
  return Math.min(Math.max(number, min), max);
}

/**
 * Round a number to a maximum amount of decimals. Not the most precise in
 * regard to floating point/scaling, but will work fine for this project.
 */
export function round(number: number, maxDecimals = 0): number {
  return Number(number.toFixed(maxDecimals));
}

export function roundPercentage(value: number): number {
  return round(minMax(value, 0, 100), 2);
}

/**
 * Simple check whether a given value is a number.
 */
export function isNumber(value: unknown): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}
