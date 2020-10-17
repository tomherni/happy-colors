import { LitElement, html, css } from 'lit-element';
import {
  hsvToHsl,
  hsvToRgb,
  rgbToCssString,
  rgbToHex,
  validateHsv,
} from '../../utils/colors.js';
import { debounce } from '../../utils/debounce.js';
import { round as roundUtil } from '../../utils/numbers.js';
import '../color-palette/color-palette.js';
import '../color-slider/color-slider.js';

const round = value => value.map(v => roundUtil(v));

export class ColorPicker extends LitElement {
  static get properties() {
    return {
      /** The HSV color to initialize with. */
      initialHsv: { type: Array },

      /** The currently picked color in different color models. */
      _colors: { type: Object },

      _initialPickerHsv: { type: Array },
    };
  }

  static get styles() {
    return css`
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
  }

  render() {
    return html`
      <div class="container">
        <div class="picker">
          <color-palette
            .initial=${this._initialPickerHsv}
            @changed=${this._onPaletteChanged}
          ></color-palette>

          <color-slider
            .initial=${this._initialPickerHsv[0]}
            @changed=${this._onSliderChanged}
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

  constructor() {
    super();
    this.initialHsv = [360, 255, 255];
    this._onWindowResize = debounce(this._onWindowResize).bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._initialize(this.initialHsv);
    window.addEventListener('resize', this._onWindowResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._onWindowResize);
  }

  get paletteElement() {
    return this.shadowRoot.querySelector('color-palette');
  }

  get sliderElement() {
    return this.shadowRoot.querySelector('color-slider');
  }

  /**
   * @public
   */
  setNewHsv(hsv) {
    this._updateColors(hsv);
    this.paletteElement.updateHsv(this._colors.hsv);
    this.sliderElement.updateHue(this._colors.hsv[0]);
  }

  _initialize(initialHsv) {
    this._updateColors(initialHsv, false);
    this._initialPickerHsv = this._colors.hsv;
  }

  _updateColors(newHsv, sendEvent = true) {
    const hsv = validateHsv(newHsv);
    const rgb = hsvToRgb(hsv);

    this._colors = {
      hsv,
      rgb,
      hsl: hsvToHsl(hsv),
      hex: rgbToHex(rgb),
    };

    if (sendEvent) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this._colors }));
    }
  }

  _onPaletteChanged({ detail: hsv }) {
    this._updateColors(hsv);
  }

  _onSliderChanged({ detail: hue }) {
    const [, s, v] = this._colors.hsv;
    this._updateColors([hue, s, v]);
    this.paletteElement.updateHsv(this._colors.hsv);
  }

  _onWindowResize() {
    this.paletteElement.updateHandlePosition();
    this.sliderElement.updateHandlePosition();
  }
}
