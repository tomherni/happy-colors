import type { PixelCoords, ValueCoords, DraggableConfig } from './types.js';

import { LitElement } from 'lit';
import { debounce } from '../../utils/debounce.js';
import { round, roundPercentage } from '../../utils/numbers.js';
import {
  getCursorCoords,
  positionToCoords,
  eventCoordsToCanvasCoords,
  haveAxesChanged,
  safeToDivideWith,
} from './utils.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = Record<string, unknown>> = new (...args: any[]) => T;

const resizeObserverSupported = typeof window.ResizeObserver !== 'undefined';

export declare class DraggableMixinInterface {
  protected draggableElementRegistered: boolean;
  protected registerDraggableElement(config: DraggableConfig): void;
  protected deregisterDraggableElement(): void;
  protected updateDraggableValue(value?: ValueCoords): void;
}

/**
 * Mixin that allows a component to register an element as a draggable element.
 * The draggable can be dragged by the user within the bounds of a specified
 * canvas element.
 */
export function DraggableMixin<T extends Constructor<LitElement>>(Base: T) {
  class DraggableMixinClass extends Base {
    protected draggableElementRegistered = false;

    private __registered = false;

    private __value?: ValueCoords;

    private __position?: PixelCoords;

    private __config?: DraggableConfig;

    private __dragState?: {
      canvasRect: DOMRect;
      draggableCoords: PixelCoords;
      cursorOffset?: PixelCoords;
    };

    private __resizeObserver?: ResizeObserver;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super();
      this.__startDrag = this.__startDrag.bind(this);
      this.__drag = debounce(this.__drag).bind(this);
      this.__stopDrag = this.__stopDrag.bind(this);
      this.__onCanvasResize = debounce(this.__onCanvasResize).bind(this);
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
     */
    protected registerDraggableElement(config: DraggableConfig): void {
      if (this.__registered) {
        this.deregisterDraggableElement();
      }
      this.draggableElementRegistered = true;
      this.__registered = true;
      this.__init(config);
      this.__manageEventListeners(true);
      this.__observeCanvasResizes();
    }

    /**
     * Deregister the draggable element by no longer acting upon drag events
     * initiated by the user, or on position update requests.
     */
    protected deregisterDraggableElement(): void {
      this.draggableElementRegistered = false;
      this.__registered = false;
      this.__manageEventListeners(false);
      this.__unobserveCanvasResizes();
    }

    private __manageEventListeners(initializing: boolean) {
      const handler = initializing
        ? window.addEventListener
        : window.removeEventListener;

      handler('mousedown', this.__startDrag, { passive: false });
      handler('mousemove', this.__drag, { passive: false });
      handler('mouseup', this.__stopDrag);
      handler('touchstart', this.__startDrag, { passive: false });
      handler('touchmove', this.__drag, { passive: false });
      handler('touchend', this.__stopDrag);
      handler('contextmenu', this.__onContextMenu);
    }

    /**
     * Observe changes in the canvas element's dimensions.
     */
    private __observeCanvasResizes() {
      if (!resizeObserverSupported) {
        window.addEventListener('resize', this.__onCanvasResize);
      } else {
        this.__resizeObserver = new ResizeObserver(this.__onCanvasResize);
        this.__resizeObserver.observe(this.__config!.canvas);
      }
    }

    private __unobserveCanvasResizes() {
      if (!resizeObserverSupported) {
        window.removeEventListener('resize', this.__onCanvasResize);
      } else {
        this.__resizeObserver?.disconnect();
      }
    }

    /**
     * Debounced wrapper method to ensure the draggable element maintains its
     * position in the canvas whenever the canvas resizes.
     */
    private __onCanvasResize() {
      if (this.__registered) {
        this.__syncDraggablePositionToValue();
      }
    }

    /**
     * Update the draggable element's value, and with that its position. This
     * method can be used when a new value was computed (without dragging).
     */
    protected updateDraggableValue(value?: ValueCoords): void {
      if (this.__registered) {
        const newValue = value || this.__value!;
        const newCoords = positionToCoords(newValue, this.__config!.canvas);
        this.__updateDraggable(newCoords);
      }
    }

    /**
     * Initialize the draggable element by setting its initial value and by
     * setting up its configuration.
     */
    private __init(config: DraggableConfig) {
      this.__config = config;
      this.updateDraggableValue(this.__config.initial);
    }

    /**
     * Enter a dragging state and start dragging the draggable element when
     * dragging is initiated by the user.
     */
    private __startDrag(event: MouseEvent | TouchEvent) {
      const composedPath = event.composedPath();
      if (!composedPath.includes(this.__config!.canvas)) {
        return;
      }
      event.preventDefault();

      const canvasRect = this.__config!.canvas.getBoundingClientRect();
      const { x, y } = this.__config!.draggable.getBoundingClientRect();

      this.__dragState = {
        canvasRect,
        draggableCoords: eventCoordsToCanvasCoords({ x, y }, canvasRect),
      };

      // A click anywhere on the draggable should not make it jump to that spot.
      // Instead, ignore the click position vs. draggable position difference.
      if (composedPath.includes(this.__config!.draggable)) {
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
     */
    private __drag(event: MouseEvent | TouchEvent) {
      if (this.__registered && this.__dragState) {
        event.preventDefault();
        this.__onDragEvent(event);
      }
    }

    /**
     * Clear the dragging state when dragging stops.
     */
    private __stopDrag() {
      this.__dragState = undefined;
    }

    /**
     * Determine the new position for the draggable based on a drag event.
     */
    private __onDragEvent(event: MouseEvent | TouchEvent) {
      const { canvasRect, draggableCoords: prevCoords } = this.__dragState!;
      const cursor = getCursorCoords(event);

      if (this.__dragState!.cursorOffset) {
        cursor.x -= this.__dragState!.cursorOffset.x;
        cursor.y -= this.__dragState!.cursorOffset.y;
      }

      const newCoords = eventCoordsToCanvasCoords(cursor, canvasRect);
      const coords = {
        x: round(this.__config!.lockX ? prevCoords.x : newCoords.x, 1),
        y: round(this.__config!.lockY ? prevCoords.y : newCoords.y, 1),
      };

      if (haveAxesChanged(coords, prevCoords)) {
        this.__dragState!.draggableCoords = coords;
        this.__updateDraggable(coords);
      }
    }

    /**
     * Update the draggable element's value and position.
     */
    private __updateDraggable(coords: PixelCoords) {
      this.__updateDraggablePosition(coords);
      this.__updateDraggableValue(coords);
    }

    private __updateDraggablePosition(coords: PixelCoords) {
      if (haveAxesChanged(coords, this.__position)) {
        this.__position = coords;
        this.__config!.draggable.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
      }
    }

    private __updateDraggableValue(coords: PixelCoords) {
      const { offsetWidth, offsetHeight } = this.__config!.canvas;

      const value = {
        x: safeToDivideWith(coords.x, offsetWidth)
          ? roundPercentage((coords.x / offsetWidth) * 100)
          : 0,
        y: safeToDivideWith(coords.y, offsetHeight)
          ? roundPercentage((coords.y / offsetHeight) * 100)
          : 0,
      };

      if (haveAxesChanged(value, this.__value)) {
        this.__value = value;
        this.__config!.callback(this.__value);
      }
    }

    /**
     * Update the draggable element's position to match its current value. This
     * method can be used when the value and position might be out of sync.
     */
    private __syncDraggablePositionToValue() {
      const newCoords = positionToCoords(this.__value!, this.__config!.canvas);
      this.__updateDraggablePosition(newCoords);
    }

    /**
     * Chromium won't send the "mouseup" event after a right-click. So dragging
     * needs to be stopped or else the cursor will continue to drag on hover.
     */
    private __onContextMenu() {
      this.__stopDrag();
    }
  }

  // TODO: avoid casting to unknown (done to be able to include protected fields)
  return DraggableMixinClass as unknown as Constructor<DraggableMixinInterface> &
    T;
}
