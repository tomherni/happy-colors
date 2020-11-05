import { debounce } from '../utils/debounce.js';
import { minMax, round, isNumber } from '../utils/numbers.js';

const validatePercentage = value => round(minMax(value, 0, 100), 2);

/**
 * Configuration to set up a draggable element.
 * @typedef {import('./../types').DraggableConfig} DraggableConfig
 */

/**
 * Coordinates along the X and Y axes on a canvas expressed in pixels. These
 * coords are used to correctly position a draggable element via CSS.
 * @typedef {import('./../types').PixelCoords} PixelCoords
 */

/**
 * Coordinates along the X and Y axes on a canvas expressed in percentages.
 * These coords are used to translate a draggable element's position to the
 * value that they represent.
 * @typedef {import('./../types').PositionCoords} PositionCoords
 */

/**
 * Get the cursor coordinates within the viewport. For touch devices we get the first contact.
 * @param {MouseEvent | TouchEvent} event
 * @returns {PixelCoords}
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
 * @param {PositionCoords} position
 * @param {HTMLElement} canvas
 * @returns {PixelCoords}
 */
function convertPositionToCoords(position, canvas) {
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
 * @param {PixelCoords} coords
 * @param {DOMRect} canvas
 * @returns {PixelCoords}
 */
function convertEventCoordsToCanvasCoords(coords, canvas) {
  return {
    x: minMax(coords.x - canvas.left, 0, canvas.width),
    y: minMax(coords.y - canvas.top, 0, canvas.height),
  };
}

/**
 * Check whether any axes changed by comparing new axes with previous values.
 * @param {PixelCoords | PositionCoords} axes
 * @param {PixelCoords | PositionCoords} previous
 * @returns {Boolean}
 */
function haveAxesChanged(axes, previous) {
  return axes?.x !== previous?.x || axes?.y !== previous?.y;
}

export const DraggableMixin = Base =>
  class extends Base {
    constructor() {
      super();

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
     * @param {DraggableConfig} config
     */
    registerDraggableElement(config) {
      if (this.__registered) {
        this.deregisterDraggableElement();
      }
      this.__registered = true;
      this.__manageEventListeners(window.addEventListener);
      this.__initialize(config);
    }

    deregisterDraggableElement() {
      this.__registered = false;
      this.__manageEventListeners(window.removeEventListener);
    }

    __manageEventListeners(handler) {
      handler('mousedown', this.__startDrag, { passive: false });
      handler('mousemove', this.__drag, { passive: false });
      handler('mouseup', this.__stopDrag);

      handler('touchstart', this.__startDrag, { passive: false });
      handler('touchmove', this.__drag, { passive: false });
      handler('touchend', this.__stopDrag);

      handler('resize', this.__onWindowResize);
    }

    /**
     * @param {PositionCoords} [position]
     */
    updateDraggablePosition(position = this.__position) {
      if (this.__registered) {
        const coords = convertPositionToCoords(position, this.__config.canvas);
        this.__updateDraggablePosition(coords);
      }
    }

    /**
     * Set up our state and the initial value for the draggable element.
     * @param {DraggableConfig} config
     */
    __initialize(config) {
      this.__config = config;
      this.updateDraggablePosition(this.__config.initial);
    }

    /**
     * Create the drag context and initiate the dragging if it occurred within the canvas.
     * @param {MouseEvent | TouchEvent} event
     */
    __startDrag(event) {
      if (!event.composedPath().includes(this.__config.canvas)) {
        return;
      }

      event.preventDefault();
      const canvasRect = this.__config.canvas.getBoundingClientRect();
      const draggableRect = this.__config.draggable.getBoundingClientRect();
      const draggableCoords = { x: draggableRect.x, y: draggableRect.y };

      this.__dragState = {
        canvasRect,
        draggableCoords: convertEventCoordsToCanvasCoords(
          draggableCoords,
          canvasRect
        ),
      };

      this.__onDragEvent(event);
    }

    /**
     * Update the draggable position whenever the client tries to move it.
     * @param {MouseEvent | TouchEvent} event
     */
    __drag(event) {
      if (this.__dragState) {
        event.preventDefault();
        this.__onDragEvent(event);
      }
    }

    /**
     * Clean up the dragging state when dragging stops.
     */
    __stopDrag() {
      this.__dragState = undefined;
    }

    /**
     * Calculate and update the draggable's new position on the canvas based on client coordinates.
     * @param {MouseEvent | TouchEvent} event
     */
    __onDragEvent(event) {
      const { canvasRect, draggableCoords: prevCoords } = this.__dragState;

      const cursor = getCursorCoords(event);
      const newCoords = convertEventCoordsToCanvasCoords(cursor, canvasRect);
      const coords = {
        x: this.__config.lockX ? prevCoords.x : newCoords.x,
        y: this.__config.lockY ? prevCoords.y : newCoords.y,
      };

      if (haveAxesChanged(coords, prevCoords)) {
        this.__dragState.draggableCoords = coords;
        this.__updateDraggablePosition(coords);
      }
    }

    /**
     * @param {PixelCoords} coords
     */
    __updateDraggablePosition({ x, y }) {
      const position = {
        x: validatePercentage((x / this.__config.canvas.offsetWidth) * 100),
        y: validatePercentage((y / this.__config.canvas.offsetHeight) * 100),
      };

      if (haveAxesChanged(position, this.__position)) {
        this.__position = position;
        this.__config.draggable.style.transform = `translate(${x}px, ${y}px)`;
        this.__config.callback(this.__position);
      }
    }

    __onWindowResize() {
      // TODO: look into replacing this with a resize observer
      this.updateDraggablePosition();
    }
  };
