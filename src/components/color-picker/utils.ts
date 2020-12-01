// @ts-nocheck

/**
 * Check if a color changed by comparing it with its previous value.
 * @param {Array|undefined} value
 * @param {Array|undefined} previous
 * @returns {Boolean}
 */
export function hasColorChanged(value, previous) {
  return Array.isArray(value) && Array.isArray(previous)
    ? value.some((val, index) => val !== previous[index])
    : value !== previous;
}
