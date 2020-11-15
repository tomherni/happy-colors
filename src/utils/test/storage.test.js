import { expect } from '@open-wc/testing';

import { storageManager, createStorageInterface } from '../storage.js';

describe('storage utils', () => {
  const storageItem = createStorageInterface('picked-hsv');
  storageManager.storage = {};

  after(() => {
    storageManager.storage = storageManager._originalStorage;
  });

  describe('storage item interface', () => {
    it('should expose methods for a storage item', () => {
      expect(storageItem.get).to.be.a('function');
      expect(storageItem.set).to.be.a('function');
      expect(storageItem.remove).to.be.a('function');
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

    it('should return an error when the set value is invalid', () => {
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
    it('should set a value in the storage', () => {
      let set;
      storageManager.storage.setItem = (...args) => {
        set = args;
      };

      const result = storageItem.set([12, 34, 56]);
      expect(set).to.deep.equal(['picked-hsv', '[12,34,56]']);
      expect(result.data).to.deep.equal('[12,34,56]');
      expect(result.error).to.equal(undefined);
    });

    it('should return an error when the set value is invalid', () => {
      let set;
      storageManager.storage.setItem = () => {
        set = true;
      };

      let result = storageItem.set([]);
      expect(set).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);

      result = storageItem.set([1, 2]);
      expect(set).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);

      result = storageItem.set([1, null, 3]);
      expect(set).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);

      result = storageItem.set('foo');
      expect(set).to.deep.equal(false);
      expect(result.data).to.equal(undefined);
      expect(result.error).to.deep.equal(true);
    });
  });
});
