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
  @property({ type: Array, hasChanged: hasColorChanged })
  hsv: Hsv;

  private _colors: Colors;

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

    @media (min-width: 800px) {
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
            .hsv=${this._colors.hsv}
            @changed=${this._onPaletteChanged}
          ></color-palette>

          <color-slider
            .hue=${this._colors.hsv[0]}
            @changed=${this._onHueSliderChanged}
          ></color-slider>
        </div>

        <div class="panel">
          <div
            class="color"
            style="background-color: ${rgbToCssString(this._colors.rgb)}"
          ></div>

          <dl>
            <div>
              <dt>HEX</dt>
              <dd>#${this._colors.hex}</dd>
            </div>
            <div>
              <dt>RGB</dt>
              <dd>${round(this._colors.rgb).join(', ')}</dd>
            </div>
            <div>
              <dt>HSB</dt>
              <dd>${round(this._colors.hsv).join(', ')}</dd>
            </div>
            <div>
              <dt>HSL</dt>
              <dd>${round(this._colors.hsl).join(', ')}</dd>
            </div>
          </dl>
        </div>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setHsv(this.hsv || [360, 255, 255]);
  }

  update(changedProperties: PropertyValues): void {
    if (changedProperties.has('hsv') && this.hsv) {
      this._setColors(this.hsv);
    }
    super.update(changedProperties);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hsv') && this.hsv) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this.hsv }));
    }
  }

  private _setHsv(hsv: Hsv) {
    if (hasColorChanged(hsv, this.hsv)) {
      this.hsv = validateHsv(hsv);
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
    const [, s, v] = this.hsv;
    this._setHsv([hue, s, v]);
  }
}
