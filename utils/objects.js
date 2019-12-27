/**
 * Safely traverse an object path and return the requested value.
 * @param {Object} obj
 * @param {String} path
 * @returns {* | undefined}
 */
export function get(obj, path) {
  try {
    return path.split('.').reduce((all, current) => all[current], obj);
  } catch (error) {
    return undefined;
  }
}
