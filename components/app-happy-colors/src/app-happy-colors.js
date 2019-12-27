import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { hsvToHsl, hsvToRgb, hsvToHex, rgbToHex, validateHsv } from '../../../utils/colors.js';
import { hsvStorage, colorSchemeStorage } from './storage-utils.js';
import '../../color-picker/color-picker.js';
import '../../color-scheme/color-scheme.js';

function when(condition, template) {
  return condition ? template() : undefined;
}

function createCustomScheme(storage = []) {
  const scheme = [];
  for (let i = 0; i < 4; i += 1) {
    scheme[i] = storage[i];
  }
  return scheme;
}

export class AppHappyColors extends LitElement {
  static get properties() {
    return {
      /** The currently picked color in different color models. */
      colors: { type: Object },

      /** The user's saved color scheme. */
      _savedScheme: { type: Object },

      _error: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      *,
      *::after {
        box-sizing: border-box;
      }

      /* Error message. */

      .error {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: calc(12px + var(--height-rainbow)) 16px 12px;
        background-color: #6f1a0b;
      }

      .error p {
        margin: 0 32px 0 0;
      }

      .error button {
        padding: 4px 16px;
        color: var(--color-font);
        font: inherit;
        background-color: transparent;
        border: 1px solid #c8381e;
      }

      .error button:hover {
        padding: 4px 16px;
        color: var(--color-font);
        font: inherit;
        background-color: var(--color-background);
        border: 1px solid #c8381e;
      }

      /* Layout structure. */

      .content {
        padding-bottom: 80px;
      }

      section {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 16px 0;
      }

      @media (min-width: 800px) {
        section {
          padding: 80px 16px 0;
        }
      }

      @media (min-width: 1600px) {
        .content {
          display: flex;
          padding: 0;
        }

        .content > section:nth-child(1) {
          flex: 0 0 auto;
          padding: 80px;
        }

        .content > section:nth-child(2) {
          flex: 1 1 auto;
          padding: 80px;
        }

        section {
          max-width: none;
          padding: 0;
        }
      }

      /* General styling. */

      h1 {
        margin: 0;
        font-size: 48px;
        text-align: center;
      }

      h1 + p {
        margin: 0 0 40px;
        font-size: 24px;
        text-align: center;
      }

      h2 {
        margin: 8px 0 40px;
        font-size: 40px;
        text-align: center;
      }

      h2 > span {
        display: block;
        line-height: normal;
      }

      .highlight {
        color: var(--color-highlight);
      }

      .dot {
        margin-left: 4px;
        color: var(--color-highlight);
      }

      @media (min-width: 800px) {
        h1 {
          font-size: 60px;
        }

        h1 + p {
          margin: 0 0 96px;
          font-size: 32px;
        }

        h2 {
          margin: 8px 0 96px;
          font-size: 48px;
        }
      }

      /* Section: color picker. */

      .color-picker {
        display: flex;
        justify-content: center;
      }

      .custom-scheme {
        display: flex;
        justify-content: center;
        margin-top: 24px;
      }

      .custom-scheme .color > div {
        position: relative;
        width: 72px;
        height: 48px;
        background-color: #333;
        border: 1px solid #000;
        cursor: pointer;
      }

      .custom-scheme .color + .color > div {
        border-left: none;
      }

      .custom-scheme .color.empty > div::after {
        content: '+';
        display: block;
        color: #aaa;
        font-weight: 700;
        font-size: 28px;
        text-align: center;
      }

      .custom-scheme .color span {
        display: block;
        font-size: 18px;
      }

      .reset-custom-scheme {
        margin-top: 64px;
        text-align: center;
      }

      .reset-custom-scheme button {
        padding: 8px 16px;
        color: var(--color-font);
        font: inherit;
        background-color: var(--color-background);
        border: 1px solid var(--color-highlight);
      }

      .reset-custom-scheme button:hover {
        color: var(--color-background);
        background-color: var(--color-highlight);
      }

      @media (min-width: 800px) {
        .custom-scheme {
          margin-top: 64px;
        }

        .custom-scheme .color > div {
          width: 112px;
          height: 64px;
        }

        .custom-scheme .color.empty > div::after {
          font-size: 40px;
        }
      }

      /* Section: generated color schemes. */

      .color-scheme + .color-scheme {
        margin-top: 40px;
      }

      .color-scheme color-scheme {
        width: 100%;
        height: 100px;
        margin-top: 16px;
      }

      .color-scheme p {
        margin: 0;
      }

      h3 {
        margin: 0;
        font-size: 1.2em;
      }

      @media (min-width: 400px) {
        .color-scheme color-scheme {
          width: 336px;
        }
      }

      @media (min-width: 1600px) {
        .color-scheme {
          display: flex;
        }

        .color-scheme + .color-scheme {
          margin-top: 80px;
        }

        .color-scheme color-scheme {
          margin-top: 12px;
        }

        .color-scheme > *:nth-child(1) {
          flex: 1 1 auto;
          padding-right: 80px;
        }

        .color-scheme > *:nth-child(2) {
          flex: 0 0 auto;
        }
      }
    `;
  }

  render() {
    return html`
      ${when(
        this._error,
        () => html`
          <div class="error">
            <p>Oops... ${this._error}</p>
            <div>
              <button
                @click=${() => {
                  this._error = undefined;
                }}
              >
                Close message
              </button>
            </div>
          </div>
        `,
      )}

      <div class="content">
        <section>
          <h1>Happy Colors<span class="dot">.</span></h1>
          <p>Create your own color scheme</p>

          <div class="color-picker">
            <color-picker
              .initialHsv=${this.colors.hsv}
              @changed=${this._onColorPickerChanged}
            ></color-picker>
          </div>

          <div class="custom-scheme">
            ${this._savedScheme.map(
              (hex, index) => html`
                <div class="${classMap({ color: true, empty: !hex })}">
                  <div
                    style="background-color: #${ifDefined(hex)}"
                    @click=${() => this._saveColorToCustomScheme(index)}
                  ></div>
                  <span>${hex ? `#${hex}` : ''}&nbsp;</span>
                </div>
              `,
            )}
          </div>

          ${when(
            this._savedScheme.some(hex => !!hex),
            () => html`
              <div class="reset-custom-scheme">
                <button @click=${this._clearCustomScheme}>Reset color scheme</button>
              </div>
            `,
          )}
        </section>

        <section>
          <h2>
            <span>Generated Schemes</span><span><span class="highlight">&</span> Inspiration</span>
          </h2>

          <div>
            <div class="color-scheme">
              <div>
                <h3>Monochromatic color scheme<span class="dot">.</span></h3>
                <p>
                  The monochromatic color scheme consists of a base color, and a range of its
                  shades.
                </p>
              </div>
              <color-scheme
                scheme="monochromatic"
                .baseColor=${this.colors.hsv}
                @color-scheme-select=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>

            <div class="color-scheme">
              <div>
                <h3>Analogous color scheme<span class="dot">.</span></h3>
                <p>
                  The analogous color scheme adds two additional colors on the color wheel: one on
                  either side of the base color, distributed evenly.
                </p>
              </div>
              <color-scheme
                scheme="analogous"
                show-hex
                .baseColor=${this.colors.hsv}
                @color-scheme-select=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>

            <div class="color-scheme">
              <div>
                <h3>Complementary color scheme<span class="dot">.</span></h3>
                <p>
                  The complementary color scheme adds one opposite (complement) color. This color is
                  on the exact opposite side of the color wheel.
                </p>
              </div>
              <color-scheme
                scheme="complementary"
                show-hex
                .baseColor=${this.colors.hsv}
                @color-scheme-select=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>

            <div class="color-scheme">
              <div>
                <h3>Triadic color scheme<span class="dot">.</span></h3>
                <p>
                  The triadic color scheme adds two additional colors. All three colors are
                  distributed evenly around the color wheel.
                </p>
              </div>
              <color-scheme
                scheme="triadic"
                show-hex
                .baseColor=${this.colors.hsv}
                @color-scheme-select=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  constructor() {
    super();
    this._initializeColors();
    this._initializeSavedScheme();
  }

  _initializeColors() {
    const hsv = this._getHsvFromStorage() || [279, 82, 90];
    this._updateColors({ hsv });
  }

  _initializeSavedScheme() {
    const scheme = this._getColorSchemeFromStorage() || [];
    this._savedScheme = createCustomScheme(scheme);
  }

  _onColorPickerChanged(e) {
    this._updateColors(e.detail);
  }

  _onColorSchemeSelected(e) {
    const hsv = e.detail.split(',').map(Number);
    this.shadowRoot.querySelector('color-picker').setNewHsv(hsv);
  }

  /**
   * @param {Object} colors
   */
  _updateColors(colors) {
    const hsv = validateHsv(colors.hsv);

    this.colors = {
      hsv,
      rgb: colors.rgb || hsvToRgb(hsv),
      hsl: colors.hsl || hsvToHsl(hsv),
      hex: colors.hex || hsvToHex(hsv),
    };

    this._saveHsvToStorage(hsv);
  }

  _saveColorToCustomScheme(index) {
    const hex = rgbToHex(this.colors.rgb);

    this._saveColorSchemeToStorage(hex, index);
    this._savedScheme[index] = hex;
    this.requestUpdate();
  }

  _clearCustomScheme() {
    window.localStorage.removeItem('custom-scheme');
    this._savedScheme = createCustomScheme();
  }

  _getHsvFromStorage() {
    const { data, error } = hsvStorage.get();
    if (error) {
      this._error = 'There was a problem with the saved color, and it had to be reset.';
    }
    return data;
  }

  _saveHsvToStorage(hsv) {
    const result = hsvStorage.save(hsv);
    if (result.error) {
      this._error = 'There was a problem saving your latest color.';
    }
  }

  _getColorSchemeFromStorage() {
    const { data, error } = colorSchemeStorage.get();
    if (error) {
      this._error = 'There was a problem with the saved color scheme, and it had to be reset.';
    }
    return data;
  }

  _saveColorSchemeToStorage(hex, index) {
    const scheme = this._getColorSchemeFromStorage() || createCustomScheme();
    scheme[index] = hex;

    const result = colorSchemeStorage.save(scheme);
    if (result.error) {
      this._error = 'There was a problem saving your color scheme.';
    }
  }
}
