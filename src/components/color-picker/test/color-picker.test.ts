// @ts-nocheck

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { simulateMouseEvent } from '../../../mixins/DraggableMixin/test/simulate-mouse-event.js';
import '../color-picker.js';

describe('Component: color-picker', () => {
  let element;
  let palette;
  let slider;
  let onChanged;

  beforeEach(async () => {
    element = await fixture(html`
      <color-picker
        @changed=${e => (onChanged = e.detail)}
        style="width: 393px;"
      ></color-picker>
    `);

    palette = element.shadowRoot
      .querySelector('color-palette')
      .shadowRoot.querySelector('.palette');
    slider = element.shadowRoot
      .querySelector('color-slider')
      .shadowRoot.querySelector('.slider');
  });

  afterEach(() => {
    onChanged = undefined;
  });

  it('should initialize with a default color', () => {
    expect(element.hsv).to.deep.equal([360, 100, 100]);
    expect(element._colors).to.deep.equal({
      hsv: [360, 100, 100],
      rgb: [255, 0, 0],
      hsl: [360, 100, 50],
      hex: 'FF0000',
    });
  });

  it("should update the color when the color palette's value changes", async () => {
    await simulateMouseEvent('mousedown', palette, 50, 50);

    expect(element.hsv).to.deep.equal([360, 14.29, 85.71]);
    expect(element._colors).to.deep.equal({
      hsv: [360, 14.29, 85.71],
      rgb: [218.56, 187.33, 187.33],
      hsl: [360, 30, 79.59],
      hex: 'DBBBBB',
    });
  });

  it("should update the color when the hue slider's value changes", async () => {
    await simulateMouseEvent('mousedown', slider, 0, 50);

    expect(element.hsv).to.deep.equal([308.56, 100, 100]);
    expect(element._colors).to.deep.equal({
      hsv: [308.56, 100, 100],
      rgb: [255, 0, 218.62],
      hsl: [308.56, 100, 50],
      hex: 'FF00DB',
    });
  });

  it('should send a "changed" event when the picker\'s color changed', async () => {
    expect(onChanged.hsv).to.deep.equal([360, 100, 100]); // The default value
    await simulateMouseEvent('mousedown', palette, 50, 50);
    expect(onChanged.hsv).to.deep.equal([360, 14.29, 85.71]);

    onChanged = undefined;
    await simulateMouseEvent('mousedown', palette, 50, 50);
    expect(onChanged).to.be.undefined; // Same value, should not send an event
  });

  it('should match the markup snapshot', () => {
    expect(element).shadowDom.to.equalSnapshot();
  });

  it('should pass the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
