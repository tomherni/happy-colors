// @ts-nocheck

import { expect, fixture, fixtureCleanup } from '@open-wc/testing';
import { spy } from 'sinon';
import { html } from 'lit-element';
import './draggable-test.js';

describe('draggable mixin', () => {
  let element;
  let canvas;
  let draggable;

  async function wait(ms = 0) {
    return new Promise(resolve =>
      setTimeout(() => requestAnimationFrame(resolve), ms)
    );
  }

  async function simulateMouseEvent(event, el, x, y) {
    const { left, top } = el.getBoundingClientRect();
    el.dispatchEvent(
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

  beforeEach(async () => {
    element = await fixture(html`<draggable-test></draggable-test>`);
    canvas = element.shadowRoot.querySelector('.canvas');
    draggable = element.shadowRoot.querySelector('.draggable');
  });

  afterEach(() => {
    // TODO: check if still necessary after all tests are migrated
    fixtureCleanup();
  });

  it('should set default values', () => {
    expect(element.__registered).to.be.false;
  });

  describe('Registering draggable element', () => {
    let callback;

    function config(_config) {
      return {
        canvas,
        draggable,
        callback(position) {
          callback = position;
        },
        initial: { x: 0, y: 0 },
        ..._config,
      };
    }

    afterEach(() => {
      callback = undefined;
    });

    it('should register a draggable element', () => {
      element.registerDraggableElement(config());
      expect(element.__registered).to.be.true;
    });

    /**
     * The provided initial position is a percentage, which should be translated
     * to the appropriate pixel values.
     */
    it('should position the draggable element with an initial value', () => {
      element.registerDraggableElement(config());
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      element.deregisterDraggableElement();

      element.registerDraggableElement(config({ initial: { x: 25, y: 25 } }));
      expect(draggable.style.transform).to.equal('translate(50px, 50px)');
      element.deregisterDraggableElement();

      element.registerDraggableElement(config({ initial: { x: 250, y: 250 } }));
      expect(draggable.style.transform).to.equal('translate(200px, 200px)');
      element.deregisterDraggableElement();

      element.registerDraggableElement(config({ initial: { x: -50, y: -50 } }));
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
    });

    /**
     * As they're percentages, both the provided position and the position in
     * the callback should be between 0 and 100.
     */
    it('should trigger the callback with the initial position coordinates', () => {
      element.registerDraggableElement(config());
      expect(callback).to.deep.equal({ x: 0, y: 0 });
      element.deregisterDraggableElement();

      element.registerDraggableElement(config({ initial: { x: 25, y: 25 } }));
      expect(callback).to.deep.equal({ x: 25, y: 25 });
      element.deregisterDraggableElement();

      element.registerDraggableElement(config({ initial: { x: 150, y: 150 } }));
      expect(callback).to.deep.equal({ x: 100, y: 100 });
      element.deregisterDraggableElement();

      element.registerDraggableElement(config({ initial: { x: -50, y: -50 } }));
      expect(callback).to.deep.equal({ x: 0, y: 0 });
    });

    it('should assume a 0px/0px position if no initial value is provided', () => {
      const conf = { ...config() };
      delete conf.initial;

      element.registerDraggableElement(conf);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      expect(callback).to.deep.equal({ x: 0, y: 0 });
    });
  });

  describe('Dragging draggable element', () => {
    let callback;

    beforeEach(() => {
      element.registerDraggableElement({
        canvas,
        draggable,
        callback(position) {
          callback = position;
        },
        initial: { x: 0, y: 0 },
      });
    });

    afterEach(() => {
      callback = undefined;
    });

    it('should drag the draggable element', async () => {
      // Start dragging (mousedown)
      await simulateMouseEvent('mousedown', canvas, 10, 20);
      expect(draggable.style.transform).to.equal('translate(10px, 20px)');
      expect(callback).to.deep.equal({ x: 5, y: 10 });
      expect(element.__dragState).to.be.an('object').that.is.not.empty;

      // Drag... (mousemove)
      await simulateMouseEvent('mousemove', canvas, 80, 50);
      expect(draggable.style.transform).to.equal('translate(80px, 50px)');
      expect(callback).to.deep.equal({ x: 40, y: 25 });
      expect(element.__dragState).to.be.an('object').that.is.not.empty;

      await simulateMouseEvent('mousemove', canvas, 0, 0);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      expect(callback).to.deep.equal({ x: 0, y: 0 });
      expect(element.__dragState).to.be.an('object').that.is.not.empty;

      await simulateMouseEvent('mousemove', canvas, 200, 200);
      expect(draggable.style.transform).to.equal('translate(200px, 200px)');
      expect(callback).to.deep.equal({ x: 100, y: 100 });
      expect(element.__dragState).to.be.an('object').that.is.not.empty;

      await simulateMouseEvent('mousemove', canvas, 131, 87);
      expect(draggable.style.transform).to.equal('translate(131px, 87px)');
      expect(callback).to.deep.equal({ x: 65.5, y: 43.5 });
      expect(element.__dragState).to.be.an('object').that.is.not.empty;

      await simulateMouseEvent('mousemove', canvas, 200, 197);
      expect(draggable.style.transform).to.equal('translate(200px, 197px)');
      expect(callback).to.deep.equal({ x: 100, y: 98.5 });
      expect(element.__dragState).to.be.an('object').that.is.not.empty;

      // Stop dragging (mouseup).
      // Though the event contains new coords, values should not be updated.
      await simulateMouseEvent('mouseup', canvas, 50, 50);
      expect(draggable.style.transform).to.equal('translate(200px, 197px)');
      expect(callback).to.deep.equal({ x: 100, y: 98.5 });
      expect(element.__dragState).to.be.undefined;
    });

    it('should not continue to drag when the dragging stops', async () => {
      await simulateMouseEvent('mousedown', canvas, 50, 50);
      await simulateMouseEvent('mousemove', canvas, 50, 50);
      await simulateMouseEvent('mouseup', canvas, 50, 50);

      // Followup mousemove event, but it should not result in a drag. The
      // values remain unchanged.
      await simulateMouseEvent('mousemove', canvas, 100, 100);
      expect(draggable.style.transform).to.equal('translate(50px, 50px)');
      expect(callback).to.deep.equal({ x: 25, y: 25 });
      expect(element.__dragState).to.be.undefined;
    });

    it('should handle dragging outside canvas bounds', async () => {
      await simulateMouseEvent('mousedown', canvas, 0, 0);

      await simulateMouseEvent('mousemove', canvas, 1, -1);
      expect(draggable.style.transform).to.equal('translate(1px, 0px)');
      expect(callback).to.deep.equal({ x: 0.5, y: 0 });

      await simulateMouseEvent('mousemove', canvas, 0, -5000);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      expect(callback).to.deep.equal({ x: 0, y: 0 });

      await simulateMouseEvent('mousemove', canvas, 300, -300);
      expect(draggable.style.transform).to.equal('translate(200px, 0px)');
      expect(callback).to.deep.equal({ x: 100, y: 0 });

      await simulateMouseEvent('mousemove', canvas, 300, 300);
      expect(draggable.style.transform).to.equal('translate(200px, 200px)');
      expect(callback).to.deep.equal({ x: 100, y: 100 });

      await simulateMouseEvent('mousemove', canvas, -300, 300);
      expect(draggable.style.transform).to.equal('translate(0px, 200px)');
      expect(callback).to.deep.equal({ x: 0, y: 100 });

      await simulateMouseEvent('mousemove', canvas, -300, -300);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      expect(callback).to.deep.equal({ x: 0, y: 0 });
    });
  });

  describe('Locking axes', () => {
    let callback;

    function config(_config) {
      return {
        canvas,
        draggable,
        callback(position) {
          callback = position;
        },
        ..._config,
      };
    }

    it('should lock the X axis on 0px without an initial value', async () => {
      element.registerDraggableElement(config({ lockX: true }));
      await simulateMouseEvent('mousedown', canvas, 0, 0);

      await simulateMouseEvent('mousemove', canvas, 50, 50);
      expect(draggable.style.transform).to.equal('translate(0px, 50px)');
      expect(callback).to.deep.equal({ x: 0, y: 25 });

      await simulateMouseEvent('mousemove', canvas, -50, -50);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      expect(callback).to.deep.equal({ x: 0, y: 0 });

      await simulateMouseEvent('mousemove', canvas, 300, 300);
      expect(draggable.style.transform).to.equal('translate(0px, 200px)');
      expect(callback).to.deep.equal({ x: 0, y: 100 });
    });

    it('should lock the X axis on the initial value', async () => {
      element.registerDraggableElement(
        config({ initial: { x: 15, y: 15 }, lockX: true })
      );
      expect(draggable.style.transform).to.equal('translate(30px, 30px)');
      expect(callback).to.deep.equal({ x: 15, y: 15 });

      await simulateMouseEvent('mousedown', canvas, 0, 0);
      await simulateMouseEvent('mousemove', canvas, 80, 80);
      expect(draggable.style.transform).to.equal('translate(30px, 80px)');
      expect(callback).to.deep.equal({ x: 15, y: 40 });
    });

    it('should lock the Y axis on 0px without an initial value', async () => {
      element.registerDraggableElement(config({ lockY: true }));
      await simulateMouseEvent('mousedown', canvas, 0, 0);

      await simulateMouseEvent('mousemove', canvas, 50, 50);
      expect(draggable.style.transform).to.equal('translate(50px, 0px)');
      expect(callback).to.deep.equal({ x: 25, y: 0 });

      await simulateMouseEvent('mousemove', canvas, -50, -50);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)');
      expect(callback).to.deep.equal({ x: 0, y: 0 });

      await simulateMouseEvent('mousemove', canvas, 300, 300);
      expect(draggable.style.transform).to.equal('translate(200px, 0px)');
      expect(callback).to.deep.equal({ x: 100, y: 0 });
    });

    it('should lock the Y axis on the initial value', async () => {
      element.registerDraggableElement(
        config({ initial: { x: 15, y: 15 }, lockY: true })
      );
      expect(draggable.style.transform).to.equal('translate(30px, 30px)');
      expect(callback).to.deep.equal({ x: 15, y: 15 });

      await simulateMouseEvent('mousedown', canvas, 0, 0);
      await simulateMouseEvent('mousemove', canvas, 80, 80);
      expect(draggable.style.transform).to.equal('translate(80px, 30px)');
      expect(callback).to.deep.equal({ x: 40, y: 15 });
    });
  });

  describe('Deregistering draggable element', () => {
    let callback;

    beforeEach(() => {
      element.registerDraggableElement({
        canvas,
        draggable,
        callback(position) {
          callback = position;
        },
        initial: { x: 0, y: 0 },
      });

      callback = undefined;
    });

    it('should deregister a draggable element', () => {
      element.deregisterDraggableElement();
      expect(element.__registered).to.be.false;
    });

    it('should no longer drag when deregistered', async () => {
      const __onDragEvent = spy(element, '__onDragEvent');

      // Start a drag
      await simulateMouseEvent('mousedown', canvas, 20, 20);
      expect(draggable.style.transform).to.equal('translate(20px, 20px)');
      expect(__onDragEvent.calledOnce).to.be.true;

      // Deregister element
      element.deregisterDraggableElement();
      callback = undefined;

      // Dragging should have no effect anymore
      await simulateMouseEvent('mousemove', canvas, 40, 40);
      await simulateMouseEvent('mouseup', canvas, 60, 60);
      await simulateMouseEvent('mousedown', canvas, 80, 80);
      expect(draggable.style.transform).to.equal('translate(20px, 20px)'); // previous value
      expect(callback).to.be.undefined;
      expect(__onDragEvent.calledOnce).to.be.true; // still called only once
    });

    it('should deregister when the element gets disconnected', async () => {
      element.remove();
      expect(element.__registered).to.be.false;
      await simulateMouseEvent('mousedown', canvas, 50, 50);
      await simulateMouseEvent('mousemove', canvas, 50, 50);
      await simulateMouseEvent('mouseup', canvas, 50, 50);
      expect(draggable.style.transform).to.equal('translate(0px, 0px)'); // initial value
      expect(callback).to.be.undefined;
    });
  });

  describe('Misc.', () => {
    let callback;

    beforeEach(() => {
      element.registerDraggableElement({
        canvas,
        draggable,
        callback(position) {
          callback = position;
        },
        initial: { x: 50, y: 50 },
      });
    });

    afterEach(() => {
      callback = undefined;
    });

    /**
     * The other dragging tests are based on dragging in the canvas. This tests
     * dragging the draggable element explicitly.
     */
    it('should drag with the actual draggable element', async () => {
      draggable.style.width = '20px';
      draggable.style.height = '20px';

      expect(draggable.style.transform).to.equal('translate(100px, 100px)');
      expect(callback).to.deep.equal({ x: 50, y: 50 });

      // 15px away from 20px draggable size is still in the draggable, so there
      // should be no change in values.
      await simulateMouseEvent('mousedown', draggable, 15, 15);
      expect(draggable.style.transform).to.equal('translate(100px, 100px)');
      expect(callback).to.deep.equal({ x: 50, y: 50 });

      // From this point we start dragging.
      await simulateMouseEvent('mousemove', draggable, 16, 16);
      expect(draggable.style.transform).to.equal('translate(101px, 101px)');
      expect(callback).to.deep.equal({ x: 50.5, y: 50.5 });

      await simulateMouseEvent('mousemove', draggable, 80, 80);
      expect(draggable.style.transform).to.equal('translate(166px, 166px)');
      expect(callback).to.deep.equal({ x: 83, y: 83 });

      await simulateMouseEvent('mousemove', draggable, 300, 300);
      expect(draggable.style.transform).to.equal('translate(200px, 200px)');
      expect(callback).to.deep.equal({ x: 100, y: 100 });

      await simulateMouseEvent('mousemove', draggable, 10, 10);
      expect(draggable.style.transform).to.equal('translate(195px, 195px)');
      expect(callback).to.deep.equal({ x: 97.5, y: 97.5 });
    });
  });
});
