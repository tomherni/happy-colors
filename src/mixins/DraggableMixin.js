import { debounce } from '../utils/debounce.js';
import { minMax, round, isNumber } from '../utils/numbers.js';

const validatePercentage = value => round(minMax(value, 0, 100), 2);

/**
 * Pixel coordinates along the x/y axis on a canvas.
 * @typedef {Object} Coords
 * @property {Number} [x]
 * @property {Number} [y]
 */

/**
 * Get the cursor coordinates within the viewport. For touch devices we get the first contact.
 * @param {MouseEvent | TouchEvent} event
 * @returns {Coords}
 */
function getCursorCoordsInViewport(event) {
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
 * @param {HTMLElement} canvas
 * @param {Object} position
 * @returns {Coords}
 */
function convertPositionToCoords(canvas, position) {
  const { offsetWidth, offsetHeight } = canvas;

  const x = isNumber(position?.x)
    ? round(minMax((offsetWidth / 100) * position.x, 0, offsetWidth), 1)
    : 0;

  const y = isNumber(position?.y)
    ? round(minMax((offsetHeight / 100) * position.y, 0, offsetHeight), 1)
    : 0;

  return { x, y };
}

/**
 * Calculate the coordinates for a draggable element within a canvas. This is calculated based on
 * data in the client area (position of the canvas and target coordinates).
 * @param {DOMRect} canvas - Canvas in which the coordinates must be placed.
 * @param {Number} x - Client coordinates along the x-axis.
 * @param {Number} y - Client coordinates along the y-axis.
 * @returns {Coords}
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
        /**
         * The draggable's position along the x/y axis of the canvas, expressed
         * in percentages.
         */
        position: { type: Object },
      };
    }

    constructor() {
      super();

      this.__dragging = false;
      this.__registered = false;

      this.__startDrag = this.__startDrag.bind(this);
      this.__drag = debounce(this.__drag).bind(this);
      this.__stopDrag = this.__stopDrag.bind(this);
      this.__onWindowResize = debounce(this.__onWindowResize).bind(this);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.__registered) {
        this.deregisterDraggableElement();
      }
    }

    /**
     * @param {Object} config
     */
    registerDraggableElement(config) {
      if (this.__registered) {
        this.deregisterDraggableElement();
      }
      this.__registered = true;

      this.__initialize(config);
      const options = { passive: false };

      window.addEventListener('mousedown', this.__startDrag, options);
      window.addEventListener('mousemove', this.__drag, options);
      window.addEventListener('mouseup', this.__stopDrag);

      window.addEventListener('touchstart', this.__startDrag, options);
      window.addEventListener('touchmove', this.__drag, options);
      window.addEventListener('touchend', this.__stopDrag);

      window.addEventListener('resize', this.__onWindowResize);
    }

    deregisterDraggableElement() {
      this.__registered = false;

      window.removeEventListener('mousedown', this.__startDrag);
      window.removeEventListener('mousemove', this.__drag);
      window.removeEventListener('mouseup', this.__stopDrag);

      window.removeEventListener('touchstart', this.__startDrag);
      window.removeEventListener('touchmove', this.__drag);
      window.removeEventListener('touchend', this.__stopDrag);

      window.removeEventListener('resize', this.__onWindowResize);
    }

    /**
     * @param {Object} position
     */
    updateDraggablePosition(position = this.position) {
      const { canvas } = this.__elements;
      const { x, y } = convertPositionToCoords(canvas, position);
      this.__updateDraggablePositionByCoords(x, y);
    }

    /**
     * Set up our state and the initial value for the draggable element.
     * @param {Object} config
     */
    __initialize(config) {
      const { canvas, draggable, ...dragConfig } = config;
      this.__elements = { canvas, draggable };
      this.__dragConfig = dragConfig;

      this.updateDraggablePosition(this.__dragConfig.initial);
    }

    /**
     * Create the drag context and initiate the dragging if it occurred within the canvas.
     * @param {MouseEvent | TouchEvent} event
     */
    __startDrag(event) {
      const { canvas, draggable } = this.__elements;

      if (event.composedPath().includes(canvas)) {
        event.preventDefault();

        const canvasRect = canvas.getBoundingClientRect();
        const { x, y } = draggable.getBoundingClientRect();

        this.__context = {
          config: this.__dragConfig,
          canvas: canvasRect,
          draggable: calculateDraggableCoords(canvasRect, x, y),
        };

        this.__dragging = true;
        this.__updateDraggablePositionByEvent(event);
      }
    }

    /**
     * Update the draggable position whenever the client tries to move it.
     * @param {MouseEvent | TouchEvent} event
     */
    __drag(event) {
      if (this.__dragging) {
        event.preventDefault();
        this.__updateDraggablePositionByEvent(event);
      }
    }

    /**
     * Clean up state when the dragging stops.
     */
    __stopDrag() {
      this.__dragging = false;
      this.__context = undefined;
    }

    /**
     * Calculate and update the draggable's new position on the canvas based on client coordinates.
     * @param {MouseEvent | TouchEvent} event
     */
    __updateDraggablePositionByEvent(event) {
      if (this.__dragging) {
        const { canvas, draggable, config } = this.__context;

        // Calculate the new X and Y coordinates.
        const cursor = getCursorCoordsInViewport(event);
        const newCoords = calculateDraggableCoords(canvas, cursor.x, cursor.y);
        const x = config.lockX ? draggable.x : newCoords.x;
        const y = config.lockY ? draggable.y : newCoords.y;

        // Update only if the position actually changed.
        if (x !== draggable.x || y !== draggable.y) {
          this.__context.draggable.x = x;
          this.__context.draggable.y = y;
          this.__updateDraggablePositionByCoords(x, y);
        }
      }
    }

    __updateDraggablePositionByCoords(x, y) {
      const { offsetWidth, offsetHeight } = this.__elements.canvas;

      this.position = {
        x: validatePercentage((x / offsetWidth) * 100),
        y: validatePercentage((y / offsetHeight) * 100),
      };

      this.__elements.draggable.style.transform = `translate(${x}px, ${y}px)`;
    }

    __onWindowResize() {
      // TODO: look into replacing this with a resize observer
      this.updateDraggablePosition();
    }
  };
