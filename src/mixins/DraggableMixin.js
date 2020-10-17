import { debounce } from '../utils/debounce.js';
import { minMax } from '../utils/numbers.js';

const events = {
  dragStart: ['mousedown', 'touchstart'],
  drag: ['mousemove', 'touchmove'],
  dragEnd: ['mouseup', 'touchend'],
};

/**
 * Get the cursor coordinates within the viewport. For touch devices we get the first contact.
 * @param {MouseEvent | TouchEvent} event
 */
function getCursorCoords(event) {
  let source = event;

  if (event.type === 'touchstart' || event.type === 'touchmove') {
    const touchEvent = event.originalEvent || event;
    [source] = touchEvent.touches || touchEvent.changedTouches;
  }

  return {
    x: source.clientX,
    y: source.clientY,
  };
}

/**
 * Calculate the coordinates for a draggable element within a canvas. This is calculated based on
 * data in the client area (position of the canvas and target coordinates).
 * @param {DOMRect} canvas - Canvas in which the coordinates must be placed.
 * @param {Number} x - Client coordinates along the x-axis.
 * @param {Number} y - Client coordinates along the y-axis.
 * @returns {Object}
 */
function calculateDraggableCoords(canvas, x, y) {
  const { top, left, width, height } = canvas;
  return {
    x: minMax(x - left, 0, width),
    y: minMax(y - top, 0, height),
  };
}

export const DraggableMixin = Base =>
  class extends Base {
    static get properties() {
      return {
        /** The canvas and draggable elements provided via config. */
        elements: { type: Object },

        /** The draggable's coordinates along the x/y axis of the canvas. */
        position: { type: Object },
      };
    }

    constructor() {
      super();

      this._dragging = false;

      this._dragStart = this._dragStart.bind(this);
      this._drag = debounce(this._drag).bind(this);
      this._dragEnd = this._dragEnd.bind(this);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._teardown();
    }

    /**
     * @param {Object} config
     */
    createDraggableElement(config) {
      const { canvas, draggable, ...dragConfig } = config;
      const options = { passive: false };

      this.elements = { canvas, draggable };
      this._dragConfig = dragConfig;

      events.dragStart.forEach(e => window.addEventListener(e, this._dragStart, options));
      events.drag.forEach(e => window.addEventListener(e, this._drag, options));
      events.dragEnd.forEach(e => window.addEventListener(e, this._dragEnd));
    }

    _teardown() {
      events.dragStart.forEach(e => window.removeEventListener(e, this._dragStart));
      events.drag.forEach(e => window.removeEventListener(e, this._drag));
      events.dragEnd.forEach(e => window.removeEventListener(e, this._dragEnd));
    }

    /**
     * Create the drag context and initiate the dragging if it occurred within the canvas.
     * @param {MouseEvent | TouchEvent} event
     */
    _dragStart(event) {
      if (this.elements && event.composedPath().includes(this.elements.canvas)) {
        event.preventDefault();

        const canvasRect = this.elements.canvas.getBoundingClientRect();
        const { x, y } = this.elements.draggable.getBoundingClientRect();

        this._context = {
          config: this._dragConfig,
          canvas: canvasRect,
          draggable: calculateDraggableCoords(canvasRect, x, y),
        };

        this._dragging = true;
        this._updateDraggablePosition(event);
      }
    }

    /**
     * Update the draggable position whenever the client tries to move it.
     * @param {MouseEvent | TouchEvent} event
     */
    _drag(event) {
      if (this._dragging) {
        event.preventDefault();
        this._updateDraggablePosition(event);
      }
    }

    /**
     * Clean up state when the dragging stops.
     */
    _dragEnd() {
      this._dragging = false;
      this._context = undefined;
    }

    /**
     * Calculate and update the draggable's new position on the canvas based on client coordinates.
     * @param {MouseEvent | TouchEvent} event
     */
    _updateDraggablePosition(event) {
      if (this._dragging) {
        const { canvas, draggable, config } = this._context;

        // Calculate the new X and Y coordinates.
        const cursor = getCursorCoords(event);
        const newCoords = calculateDraggableCoords(canvas, cursor.x, cursor.y);
        const x = config.lockX ? draggable.x : newCoords.x;
        const y = config.lockY ? draggable.y : newCoords.y;

        // Update only if the position actually changed.
        if (x !== draggable.x || y !== draggable.y) {
          this._context.draggable.x = x;
          this._context.draggable.y = y;
          this.position = { x, y };
        }
      }
    }
  };
