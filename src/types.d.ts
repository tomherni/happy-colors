/**
 * Coordinates along X and Y axes in pixels.
 */
export interface PixelCoords {
  x: number;
  y: number;
}

/**
 * Coordinates along X and Y axes in percentages.
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
  initial: PositionCoords;

  /** Whether the draggable can move on the X axis. */
  lockX?: boolean;

  /** Whether the draggable can move on the Y axis. */
  lockY?: boolean;
}
