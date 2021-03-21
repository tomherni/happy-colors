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
  rgbToCssString,
  validateHsv,
} from '../../utils/colors.js';
import { round as roundUtil } from '../../utils/numbers.js';
import { Hue, Hsv, Colors } from '../../types.js';
import '../color-palette/color-palette.js';
import '../color-slider/color-slider.js';

const round = (value: number[]) => value.map(v => roundUtil(v));

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

    .picker {
      flex: 1 1 auto;
      display: flex;
    }

    color-palette {
      width: 250px;
      height: 250px;
    }

    color-slider {
      height: 250px;
      margin-left: 48px;
    }

    .panel {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      width: 250px;
      margin-top: 24px;
    }

    .color {
      flex: 0 0 auto;
      width: 64px;
      height: 175px;
      margin-right: 24px;
    }

    @media (min-width: 1400px) {
      .container {
        display: flex;
      }

      color-palette {
        width: 350px;
        height: 350px;
      }

      color-slider {
        height: 350px;
        margin: 0 56px;
      }

      .panel {
        display: block;
        width: 175px;
        margin: 0;
      }

      .color {
        width: 100%;
        height: 72px;
        margin: 0 0 1em;
      }
    }

    dl {
      flex: 1 1 auto;
      margin: 0;
    }

    dl > div {
      display: flex;
      align-items: baseline;
    }

    dl > div + div {
      margin-top: 0.5em;
    }

    dt {
      flex: 1 1 auto;
      margin: 0;
      font-weight: 700;
      font-size: 18px;
    }

    dd {
      flex: 0 0 auto;
      margin: 0;
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="container">
        <div class="picker">
          <color-palette
            .hsv=${this._colors!.hsv}
            @changed=${this._onPaletteChanged}
          ></color-palette>

          <color-slider
            .hue=${this._colors!.hsv[0]}
            @changed=${this._onHueSliderChanged}
          ></color-slider>
        </div>

        <div class="panel">
          <div
            class="color"
            style="background-color: ${rgbToCssString(this._colors!.rgb)}"
          ></div>

          <dl>
            <div>
              <dt>HEX</dt>
              <dd>#${this._colors!.hex}</dd>
            </div>
            <div>
              <dt>RGB</dt>
              <dd>${round(this._colors!.rgb).join(', ')}</dd>
            </div>
            <div>
              <dt>HSB</dt>
              <dd>${round(this._colors!.hsv).join(', ')}</dd>
            </div>
            <div>
              <dt>HSL</dt>
              <dd>${round(this._colors!.hsl).join(', ')}</dd>
            </div>
          </dl>
        </div>
      </div>
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('_hsv')) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this._hsv }));
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
