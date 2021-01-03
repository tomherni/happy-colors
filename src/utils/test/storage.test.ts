// @ts-nocheck

import { expect } from '@open-wc/testing';
import { hsvStorage, colorSchemeStorage } from '../storage.js';

describe('Utils: storage', () => {
  afterEach(() => {
    window.localStorage.removeItem('picked-hsv');
    window.localStorage.removeItem('custom-scheme');
  });

  describe('picked-hsv', () => {
    describe('interface', () => {
      it('should set a new picked HSV', () => {
        hsvStorage.set([20, 40, 60]);
        expect(window.localStorage.getItem('picked-hsv')).to.equal(
          '[20,40,60]'
        );

        hsvStorage.set([60, 40, 20]);
        expect(window.localStorage.getItem('picked-hsv')).to.equal(
          '[60,40,20]'
        );
      });

      it('should get the picked HSV', () => {
        expect(hsvStorage.get()).to.deep.equal({ data: null });

        window.localStorage.setItem('picked-hsv', '[20,40,60]');
        expect(hsvStorage.get()).to.deep.equal({ data: [20, 40, 60] });

        window.localStorage.setItem('picked-hsv', '[60,40,20]');
        expect(hsvStorage.get()).to.deep.equal({ data: [60, 40, 20] });
      });

      it('should remove the picked HSV', () => {
        window.localStorage.setItem('picked-hsv', '[20,40,60]');

        hsvStorage.remove();
        expect(window.localStorage.getItem('picked-hsv')).to.be.null;
      });
    });

    describe('validation', () => {
      it('should not crash when trying to get an invalid value from storage', () => {
        window.localStorage.setItem('picked-hsv', 'xxx');
        expect(hsvStorage.get()).to.deep.equal({ data: null });

        // It should be removed from local storage
        expect(window.localStorage.getItem('picked-hsv')).to.be.null;

        window.localStorage.setItem('picked-hsv', '[10,20]');
        expect(hsvStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('picked-hsv', '[10,20,30,40]');
        expect(hsvStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('picked-hsv', '[100,foo,100]');
        expect(hsvStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('picked-hsv', '[100,"foo",100]');
        expect(hsvStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('picked-hsv', '{}');
        expect(hsvStorage.get()).to.deep.equal({ data: null });
      });

      it('should not crash when trying to set an invalid value into storage', () => {
        hsvStorage.set('xxx');
        expect(window.localStorage.getItem('picked-hsv')).to.be.null; // not saved

        // Save a legit value
        window.localStorage.setItem('picked-hsv', '[10,20,30]');

        // None of these should remove the legit value
        hsvStorage.set('xxx');
        hsvStorage.set('[10,20]');
        hsvStorage.set('[10,20,30,40]');
        hsvStorage.set('[100,foo,100]');
        hsvStorage.set('[100,"foo",100]');
        hsvStorage.set('{}');
        expect(window.localStorage.getItem('picked-hsv')).to.equal(
          '[10,20,30]'
        );
      });
    });
  });

  describe('custom-scheme', () => {
    describe('interface', () => {
      it('should set a new custom scehem', () => {
        colorSchemeStorage.set([null, null, 'FFFFFF', null]);
        expect(window.localStorage.getItem('custom-scheme')).to.equal(
          '[null,null,"FFFFFF",null]'
        );

        colorSchemeStorage.set([null, null, null, null]);
        expect(window.localStorage.getItem('custom-scheme')).to.equal(
          '[null,null,null,null]'
        );

        colorSchemeStorage.set(['333333', 'F0F0F0', '000000', 'AAAAAA']);
        expect(window.localStorage.getItem('custom-scheme')).to.equal(
          '["333333","F0F0F0","000000","AAAAAA"]'
        );
      });

      it('should get the custom scheme', () => {
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });

        window.localStorage.setItem(
          'custom-scheme',
          '[null,null,"FFFFFF",null]'
        );
        expect(colorSchemeStorage.get()).to.deep.equal({
          data: [null, null, 'FFFFFF', null],
        });

        window.localStorage.setItem('custom-scheme', '[null,null,null,null]');
        expect(colorSchemeStorage.get()).to.deep.equal({
          data: [null, null, null, null],
        });

        window.localStorage.setItem(
          'custom-scheme',
          '["333333","F0F0F0","000000","AAAAAA"]'
        );
        expect(colorSchemeStorage.get()).to.deep.equal({
          data: ['333333', 'F0F0F0', '000000', 'AAAAAA'],
        });
      });

      it('should remove the custom scheme', () => {
        window.localStorage.setItem(
          'custom-scheme',
          '[null,null,"FFFFFF",null]'
        );

        colorSchemeStorage.remove();
        expect(window.localStorage.getItem('custom-scheme')).to.be.null;
      });
    });

    describe('validation', () => {
      it('should not crash when trying to get an invalid value from storage', () => {
        window.localStorage.setItem('custom-scheme', 'xxx');
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });

        // It should be removed from local storage
        expect(window.localStorage.getItem('custom-scheme')).to.be.null;

        window.localStorage.setItem(
          'custom-scheme',
          '[null,null,"FFFFFFFF",null]'
        );
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('custom-scheme', '[null,null,"FFF",null]');
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('custom-scheme', '[null,null,"foo",null]');
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('custom-scheme', '[null,null,foo,null]');
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });
        window.localStorage.setItem('custom-scheme', '{}');
        expect(colorSchemeStorage.get()).to.deep.equal({ data: null });
      });

      it('should not crash when trying to set an invalid value into storage', () => {
        colorSchemeStorage.set('xxx');
        expect(window.localStorage.getItem('custom-scheme')).to.be.null; // not saved

        // Save a legit value
        window.localStorage.setItem(
          'custom-scheme',
          '[null,null,"FFFFFFFF",null]'
        );

        // None of these should remove the legit value
        colorSchemeStorage.set('xxx');
        colorSchemeStorage.set('[10,20]');
        colorSchemeStorage.set('[10,20,30,40]');
        colorSchemeStorage.set('[100,foo,100]');
        colorSchemeStorage.set('[100,"foo",100]');
        expect(window.localStorage.getItem('custom-scheme')).to.equal(
          '[null,null,"FFFFFFFF",null]'
        );
      });
    });
  });
});
