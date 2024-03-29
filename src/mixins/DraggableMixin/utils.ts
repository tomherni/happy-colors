import type { PixelCoords, ValueCoords } from './types.js';

import { minMax, round, isNumber } from '../../utils/numbers.js';

export function safeToDivideWith(...numbers: number[]): boolean {
  return numbers.every(num => isNumber(num) && num !== 0);
}

/**
 * Get the relative cursor coordinates in the viewport. For touch devices we get
 * the first contact point.
 */
export function getCursorCoords(event: MouseEvent | TouchEvent): PixelCoords {
  const { clientX, clientY } =
    window.TouchEvent && event instanceof TouchEvent
      ? event.touches[0] || event.changedTouches[0]
      : (event as MouseEvent);

  return { x: clientX, y: clientY };
}

/**
 * Translate percentage coordinates to pixel coordinates on a canvas.
 */
export function positionToCoords(
  position: ValueCoords,
  canvas: HTMLElement
): PixelCoords {
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
 * Translate pixel coordinates provided by an event (typically viewport coords)
 * to the coords on a canvas.
 */
export function eventCoordsToCanvasCoords(
  coords: PixelCoords,
  canvas: DOMRect,
  options: { noMinMax?: boolean } = {}
): PixelCoords {
  const x = coords.x - canvas.left;
  const y = coords.y - canvas.top;

  if (options.noMinMax) {
    return { x, y };
  }

  return {
    x: minMax(x, 0, canvas.width),
    y: minMax(y, 0, canvas.height),
  };
}

/**
 * Check whether any axes changed by comparing new axes with previous values.
 */
export function haveAxesChanged(
  axes?: PixelCoords | ValueCoords,
  previous?: PixelCoords | ValueCoords
): boolean {
  return axes?.x !== previous?.x || axes?.y !== previous?.y;
}
