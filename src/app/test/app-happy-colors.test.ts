// @ts-nocheck

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import '../app-happy-colors.js';

describe('Application: app-happy-colors', () => {
  let element;

  beforeEach(async () => {
    element = await fixture(html`<app-happy-colors></app-happy-colors>`);
  });

  // TODO: see if we can mock the active-theme attr?
  it('should match the markup snapshot', () => {
    expect(element).shadowDom.to.equalSnapshot();
  });

  it('should pass the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
