// @ts-nocheck

import { debounce } from '../../utils/debounce.js';
import {
  getCursorCoords,
  positionToCoords,
  eventCoordsToCanvasCoords,
  haveAxesChanged,
  validatePercentage,
} from './utils.js';

/**
 * Mixin that allows a component to register an element as a draggable element.
 *
 * The draggable can be dragged by the user within the bounds of a specified
 * canvas element.
 */
export const DraggableMixin = Base =>
  class extends Base {
    private __registered = false;

    private __position: PositionCoords;

    private __config: DraggableConfig;

    private __dragState: {
      canvasRect: DOMRect;
      draggableCoords: PixelCoords;
      cursorOffset?: PixelCoords;
    };

    constructor() {
      super();
      this.__startDrag = this.__startDrag.bind(this);
      this.__drag = debounce(this.__drag).bind(this);
      this.__stopDrag = this.__stopDrag.bind(this);
      this.__onWindowResize = debounce(this.__onWindowResize).bind(this);
      this.__onContextMenu = this.__onContextMenu.bind(this);
    }

    disconnectedCallback(): void {
      super.disconnectedCallback();
      if (this.__registered) {
        this.deregisterDraggableElement();
      }
    }

    /**
     * Register an HTML element as a draggable element.
     * @param {DraggableConfig} config
     */
    protected registerDraggableElement(config) {
      if (this.__registered) {
        this.deregisterDraggableElement();
      }
      this.__registered = true;
      this.__manageEventListeners(window.addEventListener);
      this.__initialize(config);
    }

    /**
     * Deregister the draggable element by no longer acting upon drag events
     * initiated by the user, or on position update requests.
     */
    protected deregisterDraggableElement() {
      this.__registered = false;
      this.__manageEventListeners(window.removeEventListener);
    }

    private __manageEventListeners(handler) {
      handler('mousedown', this.__startDrag, { passive: false });
      handler('mousemove', this.__drag, { passive: false });
      handler('mouseup', this.__stopDrag);

      handler('touchstart', this.__startDrag, { passive: false });
      handler('touchmove', this.__drag, { passive: false });
      handler('touchend', this.__stopDrag);

      handler('resize', this.__onWindowResize);
      handler('contextmenu', this.__onContextMenu);
    }

    /**
     * Update the draggable's CSS position based on the current position coords.
     * @param {PositionCoords} [position]
     */
    protected updateDraggablePosition(position = this.__position) {
      if (this.__registered) {
        const coords = positionToCoords(position, this.__config.canvas);
        this.__updateDraggablePosition(coords);
      }
    }

    /**
     * Initialize the draggable element by setting its initial value and by
     * setting up its configuration.
     * @param {DraggableConfig} config
     */
    private __initialize(config) {
      this.__config = config;
      this.updateDraggablePosition(this.__config.initial);
    }

    /**
     * Enter a dragging state and start dragging the draggable element when
     * dragging is initiated by the user.
     * @param {MouseEvent | TouchEvent} event
     */
    private __startDrag(event) {
      const composedPath = event.composedPath();
      if (!composedPath.includes(this.__config.canvas)) {
        return;
      }
      event.preventDefault();

      const canvasRect = this.__config.canvas.getBoundingClientRect();
      const { x, y } = this.__config.draggable.getBoundingClientRect();

      this.__dragState = {
        canvasRect,
        draggableCoords: eventCoordsToCanvasCoords({ x, y }, canvasRect),
      };

      // A click anywhere on the draggable should not make it jump to that spot.
      // Instead, ignore the click position vs. draggable position difference.
      if (composedPath.includes(this.__config.draggable)) {
        const cursor = getCursorCoords(event);
        const coords = eventCoordsToCanvasCoords(cursor, canvasRect, {
          noMinMax: true,
        });
        this.__dragState.cursorOffset = {
          x: coords.x - this.__dragState.draggableCoords.x,
          y: coords.y - this.__dragState.draggableCoords.y,
        };
      }

      this.__onDragEvent(event);
    }

    /**
     * Update the draggable position whenever the client tries to move it.
     * @param {MouseEvent | TouchEvent} event
     */
    private __drag(event) {
      if (this.__dragState) {
        event.preventDefault();
        this.__onDragEvent(event);
      }
    }

    /**
     * Clean up the dragging state when dragging stops.
     */
    private __stopDrag() {
      if (this.__dragState) {
        this.__dragState = undefined;
      }
    }

    /**
     * Determine the new position for the draggable based on a drag event.
     * @param {MouseEvent | TouchEvent} event
     */
    private __onDragEvent(event) {
      const { canvasRect, draggableCoords: prevCoords } = this.__dragState;
      const cursor = getCursorCoords(event);

      if (this.__dragState.cursorOffset) {
        cursor.x -= this.__dragState.cursorOffset.x;
        cursor.y -= this.__dragState.cursorOffset.y;
      }

      const newCoords = eventCoordsToCanvasCoords(cursor, canvasRect);
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
     * Update the draggable element's position and trigger the callback.
     * @param {PixelCoords} coords
     */
    private __updateDraggablePosition({ x, y }) {
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

    /**
     * Ensure the draggable position is correct when the viewport changes.
     */
    private __onWindowResize() {
      // TODO: look into replacing this with a resize observer
      this.updateDraggablePosition();
    }

    /**
     * Chromium won't send the "mouseup" event after a right-click. So dragging
     * needs to be stopped or else the mouse will continue to drag on hover.
     */
    private __onContextMenu() {
      this.__stopDrag();
    }
  };
