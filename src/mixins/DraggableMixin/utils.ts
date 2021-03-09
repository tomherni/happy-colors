import { minMax, round, isNumber } from '../../utils/numbers.js';
import { PixelCoords, PositionCoords } from './types.js';

/**
 * Get the relative cursor coordinates in the viewport. For touch devices we get
 * the first contact point.
 * @param {MouseEvent | TouchEvent} event
 * @returns {PixelCoords}
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
 * @param {PositionCoords} position
 * @param {HTMLElement} canvas
 * @returns {PixelCoords}
 */
export function positionToCoords(
  position: PositionCoords,
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
 * @param {PixelCoords} coords
 * @param {DOMRect} canvas - Canvas on which the coordinates must be placed.
 * @param {Object} [options]
 * @returns {PixelCoords}
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
 * @param {PixelCoords | PositionCoords | undefined} axes
 * @param {PixelCoords | PositionCoords | undefined} previous
 * @returns {Boolean}
 */
export function haveAxesChanged(
  axes: PixelCoords | PositionCoords | undefined,
  previous: PixelCoords | PositionCoords | undefined
): boolean {
  return axes?.x !== previous?.x || axes?.y !== previous?.y;
}
