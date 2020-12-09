// @ts-nocheck

/**
 * Utilities to better manage getting/setting storage values.
 * E.g. avoid saving invalid values that can break functionality.
 */

const STORAGE_KEYS = {
  hsv: 'picked-hsv',
  scheme: 'custom-scheme',
};

// For testing purposes that allows for easy local storage mocking.
export const storageManager = {
  _originalStorage: window.localStorage,
  storage: window.localStorage,
};

function isValidStorageHsv(hsv: unknown): boolean {
  return (
    Array.isArray(hsv) &&
    hsv.length === 3 &&
    hsv.every(color => typeof color === 'number')
  );
}

function isValidStorageColorScheme(scheme: unknown): boolean {
  return (
    Array.isArray(scheme) && scheme.every(color => !color || color.length === 6)
  );
}

const storageValidators = {
  [STORAGE_KEYS.hsv]: isValidStorageHsv,
  [STORAGE_KEYS.scheme]: isValidStorageColorScheme,
};

function removeAndErrorOut(storageKey: string) {
  storageManager.storage.removeItem(storageKey);
  return { error: true };
}

function get(storageKey: string) {
  const storedValue = storageManager.storage.getItem(storageKey);
  if (!storedValue) {
    return { data: undefined };
  }

  try {
    const parsed = JSON.parse(storedValue);
    const validator = storageValidators[storageKey];
    return validator(parsed) ? { data: parsed } : removeAndErrorOut(storageKey);
  } catch (error) {
    return removeAndErrorOut(storageKey);
  }
}

function save(storageKey: string, value: unknown) {
  const validator = storageValidators[storageKey];
  if (!validator(value)) {
    return { error: true };
  }

  const data = JSON.stringify(value);
  storageManager.storage.setItem(storageKey, data);

  return { data };
}

function remove(storageKey: string) {
  storageManager.storage.removeItem(storageKey);
}

/**
 * Create an interface to manage a specific key in the client's Local Storage.
 * @param {String} storageKey
 * @returns {Object}
 */
export function createStorageInterface(storageKey: string) {
  return {
    get: () => get(storageKey),
    set: (value: unknown) => save(storageKey, value),
    remove: () => remove(storageKey),
  };
}

export const hsvStorage = createStorageInterface(STORAGE_KEYS.hsv);
export const colorSchemeStorage = createStorageInterface(STORAGE_KEYS.scheme);
