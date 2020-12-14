/**
 * Utilities to better manage getting/setting storage values.
 * E.g. avoid saving invalid values that can break functionality.
 */

import { Hsv, SavedScheme } from '../types.js';

interface StorageResult<T> {
  data: T | null;
}

interface StorageInterface<T> {
  get(): StorageResult<T>;
  set(value: T): void;
  remove(): void;
}

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

function remove(storageKey: string): void {
  storageManager.storage.removeItem(storageKey);
}

function get<T>(storageKey: string): StorageResult<T> {
  const storedValue = storageManager.storage.getItem(storageKey);

  if (storedValue) {
    try {
      const data = JSON.parse(storedValue);
      if (storageValidators[storageKey](data)) {
        return { data };
      }
    } catch {
      // Swallow error
    }
  }

  remove(storageKey);
  return { data: null };
}

function set<T>(storageKey: string, value: T): void {
  if (storageValidators[storageKey](value)) {
    const data = JSON.stringify(value);
    storageManager.storage.setItem(storageKey, data);
  }
}

/**
 * Create an interface to manage a specific key in the client's Local Storage.
 * @param {String} storageKey
 * @returns {StorageInterface}
 */
export function createStorageInterface<T>(
  storageKey: string
): StorageInterface<T> {
  return {
    get: () => get<T>(storageKey),
    set: (value: T) => set<T>(storageKey, value),
    remove: () => remove(storageKey),
  };
}

export const hsvStorage = createStorageInterface<Hsv>(STORAGE_KEYS.hsv);
export const colorSchemeStorage = createStorageInterface<SavedScheme>(
  STORAGE_KEYS.scheme
);
