export type Hue = number;

export type Hsv = [Hue, number, number];

export type Rgb = [number, number, number];

export type Hsl = [Hue, number, number];

export type Hex = string;

/**
 * A specific color represented in different color models.
 */
export interface Colors {
  hsv: Hsv;
  rgb: Rgb;
  hsl: Hsl;
  hex: Hex;
}

export type ColorScheme = Hsv[];

export type ColorSchemeMono = [Hsv, Hsv[]];

export type SavedSchemeValue = Hex | null;

export type SavedScheme = SavedSchemeValue[];

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
