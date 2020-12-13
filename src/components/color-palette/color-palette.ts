// @ts-nocheck

import {
  LitElement,
  html,
  css,
  property,
  TemplateResult,
  PropertyValues,
  customElement,
} from 'lit-element';
import { DraggableMixin } from '../../mixins/DraggableMixin/DraggableMixin.js';
import { PositionCoords } from '../../mixins/DraggableMixin/types.js';
import {
  hasColorChanged,
  hsvToRgb,
  validateHsv,
  rgbToCssString,
} from '../../utils/colors.js';
import { Hsv } from '../../types.js';

@customElement('color-palette')
export class ColorPalette extends DraggableMixin(LitElement) {
  /** The current color represented in the HSV color model. */
  @property({ type: Array, hasChanged: hasColorChanged })
  hsv: Hsv;

  private _canvasElement: HTMLElement;

  private _handleElement: HTMLElement;

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
    this._canvasElement = this.shadowRoot.querySelector('.palette');
    this._handleElement = this.shadowRoot.querySelector('.handle');

    this.registerDraggableElement({
      draggable: this._handleElement,
      canvas: this._canvasElement,
      callback: this._onHandlePositionChanged.bind(this),
      initial: this._convertHsvToHandlePosition(),
    });
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hsv') && this.hsv) {
      this._onHsvChanged();
      this.dispatchEvent(new CustomEvent('changed', { detail: this.hsv }));
    }
  }

  private _setHsv(hsv: Hsv) {
    if (hasColorChanged(hsv, this.hsv)) {
      this.hsv = validateHsv(hsv);
    }
  }

  private _onHsvChanged() {
    const handlePosition = this._convertHsvToHandlePosition();
    this.updateDraggablePosition(handlePosition);
    this._updatePaletteStyling();
  }

  private _onHandlePositionChanged(position: PositionCoords) {
    const hsv = this._convertHandlePositionToHsv(position);
    this._setHsv(hsv);
    this._updatePaletteStyling();
  }

  private _convertHsvToHandlePosition() {
    return {
      x: this.hsv[1],
      y: 100 - this.hsv[2],
    };
  }

  private _convertHandlePositionToHsv(position: PositionCoords) {
    const [hue] = this.hsv;
    const saturation = position.x;
    const value = 100 - position.y;
    return [hue, saturation, value];
  }

  private _updatePaletteStyling() {
    this._canvasElement.style.backgroundColor = rgbToCssString(
      hsvToRgb([this.hsv[0], 100, 100])
    );
    this._handleElement.style.backgroundColor = rgbToCssString(
      hsvToRgb(this.hsv)
    );
  }
}
