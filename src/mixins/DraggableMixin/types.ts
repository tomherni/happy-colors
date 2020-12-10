/**
 * Coordinates along the X and Y axes on a canvas expressed in pixels. These
 * coords can be used to correctly position a draggable element via CSS.
 */
export interface PixelCoords {
  x: number;
  y: number;
}

/**
 * Coordinates along the X and Y axes on a canvas expressed in percentages.
 * These coords can be used to translate a draggable element's position to the
 * value that they represent.
 */
export interface PositionCoords {
  x: number;
  y: number;
}

/**
 * Configuration to set up a draggable element.
 */
export interface DraggableConfig {
  /** The draggable element which can be dragged by the user. */
  draggable: HTMLElement;

  /** The canvas element on which the draggable is positioned. */
  canvas: HTMLElement;

  /** Callback function for when the position of the draggable changed. */
  callback(position: PositionCoords): void;

  /** The initial position of the draggable based on a starting value. */
  initial?: PositionCoords;

  /** Whether the draggable cannot move on the X axis. */
  lockX?: boolean;

  /** Whether the draggable cannot move on the Y axis. */
  lockY?: boolean;
}
