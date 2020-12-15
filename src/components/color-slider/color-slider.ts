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
import { hsvToRgb, rgbToCssString, validateHue } from '../../utils/colors.js';
import { Hue } from '../../types.js';

@customElement('color-slider')
export class ColorSlider extends DraggableMixin(LitElement) {
  /** Current hue value picked in the slider canvas. */
  @property({ type: Number })
  hue: Hue;

  private _handleElement: HTMLElement;

  static styles = css`
    :host {
      display: block;
      --slider-width: 11px;
      --handle-size: 21px;
    }

    *,
    *::after {
      box-sizing: border-box;
    }

    .slider {
      position: relative;
      width: var(--slider-width);
      height: 100%;
      background-image: linear-gradient(
        to bottom,
        rgb(255, 0, 0),
        rgb(255, 0, 255),
        rgb(0, 0, 255),
        rgb(0, 255, 255),
        rgb(0, 255, 0),
        rgb(255, 255, 0),
        rgb(255, 0, 0)
      );
      border-radius: calc(var(--slider-width) / 2);
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
      left: calc((var(--handle-size) - 10px) / 2 * -1);
      height: var(--handle-size);
      width: var(--handle-size);
      background-color: inherit;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 1px 1px 1px inset rgba(0, 0, 0, 0.3),
        1px 1px 2px rgba(0, 0, 0, 0.3);
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="slider">
        <div class="handle"></div>
      </div>
    `;
  }

  firstUpdated(): void {
    this._handleElement = this.shadowRoot.querySelector('.handle');

    this.registerDraggableElement({
      draggable: this._handleElement,
      canvas: this.shadowRoot.querySelector('.slider'),
      callback: this._onHandlePositionChanged.bind(this),
      initial: this._convertHueToHandlePosition(),
      lockX: true,
    });
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hue') && this.hue) {
      this._onHueChanged();
      this.dispatchEvent(new CustomEvent('changed', { detail: this.hue }));
    }
  }

  private _setHue(hue: Hue) {
    this.hue = validateHue(hue);
  }

  private _onHueChanged() {
    const handlePosition = this._convertHueToHandlePosition();
    this.updateDraggablePosition(handlePosition);
    this._updateSliderStyling();
  }

  private _onHandlePositionChanged(position: PositionCoords) {
    this._setHue(360 - (360 / 100) * position.y);
    this._updateSliderStyling();
  }

  private _convertHueToHandlePosition() {
    return {
      x: 0,
      y: 100 - (this.hue / 360) * 100,
    };
  }

  private _updateSliderStyling() {
    this._handleElement.style.backgroundColor = rgbToCssString(
      hsvToRgb([this.hue, 100, 100])
    );
  }
}
