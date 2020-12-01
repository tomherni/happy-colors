// @ts-nocheck

import { minMax, round, isNumber } from '../../utils/numbers.js';

export const validatePercentage = value => round(minMax(value, 0, 100), 2);

/**
 * Get the relative cursor coordinates in the viewport. For touch devices we get
 * the first contact point.
 * @param {MouseEvent | TouchEvent} event
 * @returns {PixelCoords}
 */
export function getCursorCoords(event) {
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
 * Translate percentage coordinates to pixel coordinates on a canvas.
 * @param {PositionCoords} position
 * @param {HTMLElement} canvas
 * @returns {PixelCoords}
 */
export function positionToCoords(position, canvas) {
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
export function eventCoordsToCanvasCoords(coords, canvas, options = {}) {
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
 * @param {PixelCoords | PositionCoords} axes
 * @param {PixelCoords | PositionCoords} previous
 * @returns {Boolean}
 */
export function haveAxesChanged(axes, previous) {
  return axes?.x !== previous?.x || axes?.y !== previous?.y;
}
