import type { TemplateResult, PropertyValues } from 'lit';
import type { ValueCoords } from '../../mixins/DraggableMixin/types.js';
import type { Hsv } from '../../types.js';

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { DraggableMixin } from '../../mixins/DraggableMixin/DraggableMixin.js';
import {
  hasColorChanged,
  hsvToRgb,
  validateHsv,
  rgbToCssString,
} from '../../utils/colors.js';
import { roundPercentage } from '../../utils/numbers.js';

@customElement('color-palette')
export class ColorPalette extends DraggableMixin(LitElement) {
  /** The current color represented in the HSV color model. */
  get hsv(): Hsv {
    return this._hsv;
  }

  set hsv(hsv: Hsv) {
    this._setHsv(hsv);
  }

  @state()
  private _hsv: Hsv = [360, 100, 100];

  private _canvasElement?: HTMLDivElement;

  private _handleElement?: HTMLDivElement;

  static styles = css`
    :host {
      display: block;
      --handle-size: 21px;
    }

    *,
    *::after {
      box-sizing: border-box;
    }

    .palette {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .gradients {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: linear-gradient(to right, #fff, transparent);
    }

    .gradients::after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: linear-gradient(to top, #000, transparent);
    }

    .handle {
      position: relative;
      height: 1px;
      width: 1px;
    }

    .handle::after {
      content: '';
      display: block;
      position: absolute;
      top: calc(var(--handle-size) / 2 * -1);
      left: calc(var(--handle-size) / 2 * -1);
      width: var(--handle-size);
      height: var(--handle-size);
      background-color: inherit;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 1px 1px 1px inset rgba(0, 0, 0, 0.3),
        1px 1px 2px rgba(0, 0, 0, 0.3);
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="palette">
        <div class="gradients"></div>
        <div class="handle"></div>
      </div>
    `;
  }

  firstUpdated(): void {
    this._canvasElement = this.shadowRoot!.querySelector(
      '.palette'
    ) as HTMLDivElement;
    this._handleElement = this.shadowRoot!.querySelector(
      '.handle'
    ) as HTMLDivElement;

    this.registerDraggableElement({
      draggable: this._handleElement,
      canvas: this._canvasElement,
      callback: this._onHandlePositionChanged.bind(this),
      initial: this._convertHsvToHandlePosition(),
    });
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('_hsv') && this.draggableElementRegistered) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this._hsv }));
    }
  }

  private _setHsv(hsv: Hsv) {
    const validatedHsv = validateHsv(hsv);

    if (hasColorChanged(validatedHsv, this._hsv)) {
      this._hsv = validatedHsv;

      if (this.draggableElementRegistered) {
        this._onHsvChanged();
      }
    }
  }

  private _onHsvChanged() {
    const handlePosition = this._convertHsvToHandlePosition();
    this.updateDraggableValue(handlePosition);
    this._updatePaletteStyling();
  }

  private _onHandlePositionChanged(position: ValueCoords) {
    const hsv = this._convertHandlePositionToHsv(position);
    this._setHsv(hsv);
    this._updatePaletteStyling();
  }

  private _convertHsvToHandlePosition() {
    return {
      x: this._hsv[1],
      y: roundPercentage(100 - this._hsv[2]),
    };
  }

  private _convertHandlePositionToHsv(position: ValueCoords) {
    const [hue] = this._hsv;
    const saturation = position.x;
    const value = 100 - position.y;
    return [hue, saturation, value] as Hsv;
  }

  private _updatePaletteStyling() {
    this._canvasElement!.style.backgroundColor = rgbToCssString(
      hsvToRgb([this._hsv[0], 100, 100])
    );
    this._handleElement!.style.backgroundColor = rgbToCssString(
      hsvToRgb(this._hsv)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-palette': ColorPalette;
  }
}
