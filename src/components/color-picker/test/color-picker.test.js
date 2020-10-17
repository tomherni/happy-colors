import { expect, fixture, fixtureCleanup, html } from '@open-wc/testing';

import '../color-picker.js';

describe('color-picker component', () => {
  let element;

  async function wait(ms = 0) {
    return new Promise(resolve =>
      setTimeout(() => requestAnimationFrame(resolve), ms)
    );
  }

  async function simulateMouseEvent(event, el, x, y) {
    const { left, top } = el.getBoundingClientRect();
    (event === 'mousedown'
      ? el.shadowRoot.elementFromPoint(x + left, y + top)
      : el.shadowRoot
    ).dispatchEvent(
      new MouseEvent(event, {
        view: window,
        bubbles: true,
        composed: true,
        clientX: x + left,
        clientY: y + top,
      })
    );
    await wait();
  }

  afterEach(() => {
    fixtureCleanup();
  });

  it('should instantiate the component', async () => {
    element = await fixture(html`<color-picker></color-picker>`);
    expect(element.localName).to.equal('color-picker');
    expect(element.isConnected).to.equal(true);
  });

  describe('initial color value', () => {
    beforeEach(async () => {
      element = await fixture(html`<color-picker></color-picker>`);
    });

    it('should set a property holding the initial HSV color', () => {
      expect(element.initialHsv).to.deep.equal([360, 255, 255]);
    });

    it('should pass the markup snapshot', () => {
      expect(element).shadowDom.to.equalSnapshot();
      expect(
        element.shadowRoot.querySelector('color-palette')
      ).shadowDom.to.equalSnapshot();
      expect(
        element.shadowRoot.querySelector('color-slider')
      ).shadowDom.to.equalSnapshot();
    });

    it('should pass the a11y audit', async () => {
      await expect(element).shadowDom.to.be.accessible();
      await expect(
        element.shadowRoot.querySelector('color-palette')
      ).shadowDom.to.be.accessible();
      await expect(
        element.shadowRoot.querySelector('color-slider')
      ).shadowDom.to.be.accessible();
    });
  });

  describe('dragging', () => {
    beforeEach(async () => {
      element = await fixture(html`<color-picker></color-picker>`);
    });

    context('palette', () => {
      let palette;
      let handle;

      beforeEach(async () => {
        palette = element.shadowRoot.querySelector('color-palette');
        handle = element.shadowRoot
          .querySelector('color-palette')
          .shadowRoot.querySelector('.handle');
      });

      it('should drag on mouse events', async () => {
        // Initial value before dragging starts.
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('350px, 0px');
        expect(palette._dragging).to.equal(false);
        expect(palette._context).to.equal(undefined);

        // Start dragging (first click & hold).
        await simulateMouseEvent('mousedown', palette, 10, 20);
        expect(element._colors.hex).to.equal('F0EAEA');
        expect(handle.style.transform).to.include('10px, 20px');
        expect(palette._dragging).to.equal(true);
        expect(palette._context.draggable).to.include({ x: 10, y: 20 });

        await simulateMouseEvent('mousemove', palette, 80, 50);
        expect(element._colors.hex).to.equal('DBA9A9');
        expect(handle.style.transform).to.include('80px, 50px');
        expect(palette._dragging).to.equal(true);
        expect(palette._context.draggable).to.include({ x: 80, y: 50 });

        await simulateMouseEvent('mousemove', palette, 212, 198);
        expect(element._colors.hex).to.equal('6F2C2C');
        expect(handle.style.transform).to.include('212px, 198px');
        expect(palette._dragging).to.equal(true);
        expect(palette._context.draggable).to.include({ x: 212, y: 198 });

        // Should not update the color on a dragEnd event
        await simulateMouseEvent('mouseup', palette, 100, 100);
        expect(element._colors.hex).to.equal('6F2C2C');
        expect(handle.style.transform).to.include('212px, 198px');
        expect(palette._dragging).to.equal(false);
        expect(palette._context).to.equal(undefined);
      });

      it('should handle dragging outside element bounds', async () => {
        await simulateMouseEvent('mousedown', palette, 0, 0);

        await simulateMouseEvent('mousemove', palette, 0, -1000);
        expect(element._colors.hex).to.equal('FFFFFF');
        expect(handle.style.transform).to.include('0px, 0px');
        expect(palette._context.draggable).to.include({ x: 0, y: 0 });

        await simulateMouseEvent('mousemove', palette, 1000, -1000);
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('350px, 0px');
        expect(palette._context.draggable).to.include({ x: 350, y: 0 });

        await simulateMouseEvent('mousemove', palette, 1000, 1000);
        expect(element._colors.hex).to.equal('000000');
        expect(handle.style.transform).to.include('350px, 350px');
        expect(palette._context.draggable).to.include({ x: 350, y: 350 });

        await simulateMouseEvent('mousemove', palette, -1000, 1000);
        expect(element._colors.hex).to.equal('000000');
        expect(handle.style.transform).to.include('0px, 350px');
        expect(palette._context.draggable).to.include({ x: 0, y: 350 });

        await simulateMouseEvent('mousemove', palette, -1000, -1000);
        expect(element._colors.hex).to.equal('FFFFFF');
        expect(handle.style.transform).to.include('0px, 0px');
        expect(palette._context.draggable).to.include({ x: 0, y: 0 });
      });
    });

    context('hue slider', () => {
      let slider;
      let handle;

      beforeEach(async () => {
        slider = element.shadowRoot.querySelector('color-slider');
        handle = element.shadowRoot
          .querySelector('color-slider')
          .shadowRoot.querySelector('.handle');
      });

      it('should drag on mouse events', async () => {
        // Initial value before dragging starts.
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('0px, 0px');
        expect(slider._dragging).to.equal(false);
        expect(slider._context).to.equal(undefined);

        // Start dragging (first click & hold).
        await simulateMouseEvent('mousedown', slider, 0, 20);
        expect(element._colors.hex).to.equal('FF0057');
        expect(handle.style.transform).to.include('0px, 20px');
        expect(slider._dragging).to.equal(true);
        expect(slider._context.draggable).to.include({ x: 4.5, y: 20 });

        await simulateMouseEvent('mousemove', slider, 0, 50);
        expect(element._colors.hex).to.equal('FF00DB');
        expect(handle.style.transform).to.include('0px, 50px');
        expect(slider._dragging).to.equal(true);
        expect(slider._context.draggable).to.include({ x: 4.5, y: 50 });

        await simulateMouseEvent('mousemove', slider, 0, 237);
        expect(element._colors.hex).to.equal('10FF00');
        expect(handle.style.transform).to.include('0px, 237px');
        expect(slider._dragging).to.equal(true);
        expect(slider._context.draggable).to.include({ x: 4.5, y: 237 });

        // Should not update the color on a dragEnd event
        await simulateMouseEvent('mouseup', slider, 0, 20);
        expect(element._colors.hex).to.equal('10FF00');
        expect(handle.style.transform).to.include('0px, 237px');
        expect(slider._dragging).to.equal(false);
        expect(slider._context).to.equal(undefined);
      });

      it('should handle dragging outside element bounds', async () => {
        await simulateMouseEvent('mousedown', slider, 0, 0);

        await simulateMouseEvent('mousemove', slider, 0, -1000);
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('0px, 0px');
        expect(slider._context.draggable).to.include({ x: 4.5, y: 0 });

        await simulateMouseEvent('mousemove', slider, 1000, -1000);
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('0px, 0px');
        expect(slider._context.draggable).to.include({ x: 4.5, y: 0 });

        await simulateMouseEvent('mousemove', slider, 1000, 1000);
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('0px, 350px');
        expect(slider._context.draggable).to.include({ x: 4.5, y: 350 });

        await simulateMouseEvent('mousemove', slider, -1000, 1000);
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('0px, 350px');
        expect(slider._context.draggable).to.include({ x: 4.5, y: 350 });

        await simulateMouseEvent('mousemove', slider, -1000, -1000);
        expect(element._colors.hex).to.equal('FF0000');
        expect(handle.style.transform).to.include('0px, 0px');
        expect(slider._context.draggable).to.include({ x: 4.5, y: 0 });
      });

      it('should update the palette color based on the slider value', async () => {
        const palette = element.shadowRoot.querySelector('color-palette');
        const paletteCanvas = palette.shadowRoot.querySelector('.palette');
        const paletteHandle = palette.shadowRoot.querySelector('.handle');

        await simulateMouseEvent('mousedown', slider, 0, 0);

        await simulateMouseEvent('mousemove', slider, 0, 40);
        expect(element._colors.rgb).to.deep.equal([255, 0, 174.84]);
        expect(paletteCanvas.style.backgroundColor).to.deep.equal(
          'rgb(255, 0, 175)'
        );
        expect(paletteHandle.style.backgroundColor).to.deep.equal(
          'rgb(255, 0, 175)'
        );

        await simulateMouseEvent('mousemove', slider, 0, 163);
        expect(element._colors.rgb).to.deep.equal([0, 202.56, 255]);
        expect(paletteCanvas.style.backgroundColor).to.deep.equal(
          'rgb(0, 203, 255)'
        );
        expect(paletteHandle.style.backgroundColor).to.deep.equal(
          'rgb(0, 203, 255)'
        );

        await simulateMouseEvent('mousemove', slider, 0, 360);
        expect(element._colors.rgb).to.deep.equal([255, 0, 0]);
        expect(paletteCanvas.style.backgroundColor).to.deep.equal(
          'rgb(255, 0, 0)'
        );
        expect(paletteHandle.style.backgroundColor).to.deep.equal(
          'rgb(255, 0, 0)'
        );
      });
    });
  });
});
