import { expect, fixture, fixtureCleanup } from '@open-wc/testing';
import { LitElement, html } from 'lit-element';

import { DraggableMixin } from '../DraggableMixin.js';

describe('draggable mixin', () => {
  let element;

  class TestClass extends DraggableMixin(LitElement) {}
  window.customElements.define('test-component', TestClass);

  beforeEach(async () => {
    element = await fixture(html`<test-component></test-component>`);
  });

  afterEach(() => {
    element._teardown();
    fixtureCleanup();
  });

  it('should be able to be used to create a component', () => {
    expect(element.isConnected).to.equal(true);
  });

  it('should set default values for specific properties', () => {
    expect(element._dragging).to.equal(false);
  });

  describe('Setting up dragging', () => {
    let canvas;
    let draggable;

    beforeEach(() => {
      canvas = document.createElement('div');
      draggable = document.createElement('div');
      canvas.appendChild(draggable);
      element.appendChild(canvas);
    });

    it('should create a public property containing the elements', () => {
      element.registerDraggableElement({ canvas, draggable });
      expect(element.elements).to.deep.equal({ canvas, draggable });
      expect(element._dragConfig).to.be.an('object').that.is.empty;
    });

    it('should create a private property containing dragging configuration', () => {
      element.registerDraggableElement({
        canvas,
        draggable,
        foo: true,
        bar: true,
      });
      expect(element.elements).to.deep.equal({ canvas, draggable }); // ONLY elements
      expect(element._dragConfig).to.deep.equal({ foo: true, bar: true }); // ONLY remaining properties
    });
  });
});
