import {
  LitElement,
  html,
  css,
  internalProperty,
  TemplateResult,
  PropertyValues,
  customElement,
} from 'lit-element';
import {
  hasColorChanged,
  hsvToHsl,
  hsvToRgb,
  hsvToHex,
  validateHsv,
} from '../../utils/colors.js';
import { Hue, Hsv, Colors } from '../../types.js';
import '../color-palette/color-palette.js';
import '../color-slider/color-slider.js';

@customElement('color-picker')
export class ColorPicker extends LitElement {
  /** The currently picked color represented in the HSV color model. */
  get hsv(): Hsv {
    return this._hsv;
  }

  set hsv(hsv: Hsv) {
    this._setHsv(hsv);
  }

  @internalProperty()
  private _hsv: Hsv = [360, 100, 100];

  private _colors?: Colors;

  static styles = css`
    :host {
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .color-picker {
      display: flex;
    }

    .palette-column {
      flex: 1 1 auto;
    }

    .palette-aspect-ratio {
      position: relative;
      padding-bottom: 100%;
    }

    color-palette {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    color-slider {
      flex: 0 0 auto;
      margin-left: var(--hue-slider-distance, 32px);
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="color-picker">
        <div class="palette-column">
          <div class="palette-aspect-ratio">
            <color-palette
              .hsv=${this._hsv}
              @changed=${this._onPaletteChanged}
            ></color-palette>
          </div>
        </div>

        <color-slider
          .hue=${this._hsv[0]}
          @changed=${this._onHueSliderChanged}
        ></color-slider>
      </div>
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('_hsv')) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this._colors }));
    }
  }

  private _setHsv(hsv: Hsv) {
    const validatedHsv = validateHsv(hsv);

    if (hasColorChanged(validatedHsv, this._hsv)) {
      this._hsv = validatedHsv;
      this._setColors(this._hsv);
    }
  }

  private _setColors(hsv: Hsv) {
    this._colors = {
      hsv,
      rgb: hsvToRgb(hsv),
      hsl: hsvToHsl(hsv),
      hex: hsvToHex(hsv),
    };
  }

  private _onPaletteChanged({ detail: hsv }: CustomEvent<Hsv>) {
    this._setHsv(hsv);
  }

  private _onHueSliderChanged({ detail: hue }: CustomEvent<Hue>) {
    const [, s, v] = this._hsv;
    this._setHsv([hue, s, v]);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-picker': ColorPicker;
  }
}
