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
  originalStorage: window.localStorage,
  storage: window.localStorage,
};

function isValidStorageHsv(hsv) {
  return (
    Array.isArray(hsv) &&
    hsv.length === 3 &&
    hsv.every(color => typeof color === 'number')
  );
}

function isValidStorageColorScheme(scheme) {
  return (
    Array.isArray(scheme) && scheme.every(color => !color || color.length === 6)
  );
}

const storageValidators = {
  [STORAGE_KEYS.hsv]: isValidStorageHsv,
  [STORAGE_KEYS.scheme]: isValidStorageColorScheme,
};

function removeAndErrorOut(storageKey) {
  storageManager.storage.removeItem(storageKey);
  return { error: true };
}

function get(storageKey) {
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

function save(storageKey, value) {
  const validator = storageValidators[storageKey];
  if (!validator(value)) {
    return { error: true };
  }

  const data = JSON.stringify(value);
  storageManager.storage.setItem(storageKey, data);

  return { data };
}

function remove(storageKey) {
  storageManager.storage.removeItem(storageKey);
}

/**
 * Register methods to retrieve and save data for a specific storage key. This keeps the logic
 * out of other components.
 * @param {String} _storageKey
 * @returns {Object}
 */
export function getStorageInterface(_storageKey) {
  return {
    _storageKey,
    get() {
      return get(this._storageKey);
    },
    save(value) {
      return save(this._storageKey, value);
    },
    remove() {
      return remove(this._storageKey);
    },
  };
}

export const hsvStorage = getStorageInterface(STORAGE_KEYS.hsv);
export const colorSchemeStorage = getStorageInterface(STORAGE_KEYS.scheme);
