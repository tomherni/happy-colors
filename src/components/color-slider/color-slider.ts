import {
  LitElement,
  html,
  css,
  internalProperty,
  TemplateResult,
  PropertyValues,
  customElement,
} from 'lit-element';
import { DraggableMixin } from '../../mixins/DraggableMixin/DraggableMixin.js';
import { ValueCoords } from '../../mixins/DraggableMixin/types.js';
import { hsvToRgb, rgbToCssString, validateHue } from '../../utils/colors.js';
import { roundPercentage } from '../../utils/numbers.js';
import { Hue } from '../../types.js';

@customElement('color-slider')
export class ColorSlider extends DraggableMixin(LitElement) {
  /** Current hue value picked in the slider canvas. */
  get hue(): Hue {
    return this._hue;
  }

  set hue(hue: Hue) {
    this._setHue(hue);
  }

  @internalProperty()
  private _hue: Hue = 0;

  private _handleElement?: HTMLDivElement;

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
    this._handleElement = this.shadowRoot!.querySelector(
      '.handle'
    ) as HTMLDivElement;

    this.registerDraggableElement({
      draggable: this._handleElement,
      canvas: this.shadowRoot!.querySelector('.slider') as HTMLDivElement,
      callback: this._onHandlePositionChanged.bind(this),
      initial: this._convertHueToHandlePosition(),
      lockX: true,
    });
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('_hue') && this.draggableElementRegistered) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this._hue }));
    }
  }

  private _setHue(hue: Hue) {
    const validatedHue = validateHue(hue);

    if (validatedHue !== this._hue) {
      this._hue = validatedHue;
    }

    if (this.draggableElementRegistered) {
      this._onHueChanged();
    }
  }

  private _onHueChanged() {
    const handlePosition = this._convertHueToHandlePosition();
    this.updateDraggableValue(handlePosition);
    this._updateSliderStyling();
  }

  private _onHandlePositionChanged(position: ValueCoords) {
    this._setHue(360 - (360 / 100) * position.y);
    this._updateSliderStyling();
  }

  private _convertHueToHandlePosition() {
    return {
      x: 0,
      y: roundPercentage(100 - (this._hue / 360) * 100),
    };
  }

  private _updateSliderStyling() {
    this._handleElement!.style.backgroundColor = rgbToCssString(
      hsvToRgb([this._hue, 100, 100])
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-slider': ColorSlider;
  }
}
