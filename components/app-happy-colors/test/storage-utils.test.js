import { expect } from '@open-wc/testing';

import { storageManager, getStorageInterface } from '../src/storage-utils.js';

describe('storage utils', () => {
  const storageItem = getStorageInterface('picked-hsv');
  storageManager.storage = {};

  after(() => {
    storageManager.storage = storageManager.originalStorage;
  });

  describe('storage item interface', () => {
    it('should expose a "get" and "save" method for a storage item', () => {
      expect(storageItem.get).to.be.a('function');
      expect(storageItem.save).to.be.a('function');
    });

    it('should contain a private property containing the storage key', () => {
      expect(storageItem._storageKey).to.equal('picked-hsv');
    });
  });

  describe('getting value from storage', () => {
    it('should get a value from the storage', () => {
      storageManager.storage.getItem = () => '[12, 34, 56]';
      let result = storageItem.get();
      expect(result.data).to.deep.equal([12, 34, 56]);
      expect(result.error).to.equal(undefined);

      storageManager.storage.getItem = () => '';
      result = storageItem.get();
      expect(result.data).to.deep.equal(undefined);
      expect(result.error).to.equal(undefined);
    });

    it('should return an error when the saved value is invalid', () => {
      let removed = false;
      storageManager.storage.removeItem = () => {
        removed = true;
      };

      storageManager.storage.getItem = () => '[]';
      let result = storageItem.get();
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);
      expect(removed).to.deep.equal(true);
      removed = false;

      storageManager.storage.getItem = () => '[1, 2]';
      result = storageItem.get();
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);
      expect(removed).to.deep.equal(true);
      removed = false;

      storageManager.storage.getItem = () => '[1, null, 3]';
      result = storageItem.get();
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);
      expect(removed).to.deep.equal(true);
      removed = false;

      storageManager.storage.getItem = () => 'foo';
      result = storageItem.get();
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);
      expect(removed).to.deep.equal(true);
    });
  });

  describe('saving value to storage', () => {
    it('should save a value to the storage', () => {
      let saved;
      storageManager.storage.setItem = (...args) => {
        saved = args;
      };

      const result = storageItem.save([12, 34, 56]);
      expect(saved).to.deep.equal(['picked-hsv', '[12,34,56]']);
      expect(result.data).to.deep.equal('[12,34,56]');
      expect(result.error).to.equal(undefined);
    });

    it('should return an error when the saved value is invalid', () => {
      let saved = false;
      storageManager.storage.setItem = () => {
        saved = true;
      };

      let result = storageItem.save([]);
      expect(saved).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);

      result = storageItem.save([1, 2]);
      expect(saved).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);

      result = storageItem.save([1, null, 3]);
      expect(saved).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);

      result = storageItem.save('foo');
      expect(saved).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);
    });
  });
});
