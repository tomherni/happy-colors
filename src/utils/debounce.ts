// @ts-nocheck

/**
 * Debounce a function based on RAF.
 * @param {Function} callback - Function to debounce
 * @returns {Function} Debounced function
 */
export function debounce(callback) {
  let timeout;

  return function debounced(...args) {
    window.cancelAnimationFrame(timeout);
    timeout = window.requestAnimationFrame(() => callback.apply(this, args));
  };
}
