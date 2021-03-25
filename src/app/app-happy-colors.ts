import {
  LitElement,
  html,
  css,
  property,
  internalProperty,
  TemplateResult,
  customElement,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { hasColorChanged, hsvToHex, validateHsv } from '../utils/colors.js';
import { debounce } from '../utils/debounce.js';
import { when } from '../utils/lit-html.js';
import { hsvStorage, colorSchemeStorage } from '../utils/storage.js';
import {
  observeThemeChanges,
  unobserveThemeChanges,
  getTheme,
  toggleTheme,
} from '../libs/theme.js';
import { Hsv, SavedScheme, SavedSchemeValue } from '../types.js';
import '../components/color-picker/color-picker.js';
import '../components/color-scheme/color-scheme.js';
import '../components/theme-switch/theme-switch.js';

/**
 * Create a custom color scheme template. If a saved scheme is provided then
 * the values will be used to prefill the template.
 * @param {SavedScheme} [storage]
 * @returns {SavedScheme}
 */
function createCustomScheme(storage: SavedScheme = []) {
  return new Array(4)
    .fill(null)
    .map((_null, i) => storage[i] || _null) as SavedScheme;
}

@customElement('app-happy-colors')
export class AppHappyColors extends LitElement {
  /** The currently picked color represented in the HSV color model. */
  @property({ type: Array, hasChanged: hasColorChanged })
  hsv: Hsv = [279, 82, 90];

  /** The user's saved color scheme. */
  @internalProperty()
  private _savedScheme: SavedScheme;

  /** The color scheme based on user preference. */
  @internalProperty()
  private _theme: string;

  /** Whether the page is in a scrolled position. */
  @internalProperty()
  private _scrolled = false;

  static styles = css`
    :host {
      display: block;
      --header-height: 52px;
    }

    @media (min-width: 900px) {
      :host {
        --header-height: 64px;
      }
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* Fixed header with title and theme switcher */

    .header {
      position: fixed;
      top: var(--height-rainbow);
      right: 0;
      left: 0;
      height: var(--header-height);
      background-color: var(--header-color-background);
      z-index: 1;
    }

    /* Show a shadow when scrolled. Instead of animating the box-shadow, animating */
    /* a pseudo-element and its opacity performs better. */
    .header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      box-shadow: 0 0 8px 8px var(--header-color-shadow);
      transition: opacity 400ms;
      z-index: -1;
    }

    .header.scrolled::after {
      opacity: 1;
    }

    .header .container {
      position: relative;
      max-width: 400px;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
      font-weight: bold;
      font-size: 1.3rem;
      line-height: var(--header-height);
      text-align: center;
    }

    theme-switch {
      position: absolute;
      top: 0;
      right: 8px;
      bottom: 0;
      margin: auto 0;
    }

    /* Layout structure */

    main {
      padding: var(--header-height) 16px 80px;
    }

    .color-management {
      max-width: 400px;
      margin: 0 auto;
    }

    .color-schemes {
      max-width: 800px;
      margin: 0 auto;
      padding-right: 5%;
    }

    @media (min-width: 900px) {
      main {
        display: flex;
      }

      .color-management {
        flex: 0 0 70%;
      }

      .color-schemes {
        flex: 0 0 30%;
      }
    }

    /* Color picker and custom color scheme */

    color-overview {
      margin-top: 16px;
    }

    .custom-color-scheme {
      display: flex;
    }

    .custom-color-scheme .column {
      flex: 1 1 0;
    }

    .custom-color-scheme .color {
      position: relative;
      width: 100%;
      height: 48px;
      background-color: var(--scheme-color-background);
      border: 1px solid var(--scheme-color-border);
      cursor: pointer;
    }

    .custom-color-scheme .column + .column .color {
      border-left: none;
    }

    .custom-color-scheme .color.empty::after {
      content: '+';
      display: block;
      color: var(--scheme-color-add);
      font-weight: bold;
      font-size: 28px;
      text-align: center;
    }

    .custom-color-scheme .hex {
      font-size: 18px;
    }

    .reset-custom-color-scheme {
      margin: 32px 0 48px;
      text-align: center;
    }

    .reset-custom-color-scheme button {
      padding: 8px 16px;
      color: var(--color-font);
      font: inherit;
      background-color: var(--color-background);
      border: 1px solid var(--color-highlight);
    }

    .reset-custom-color-scheme button:hover {
      color: var(--color-background);
      background-color: var(--color-highlight);
    }

    /* Generated color schemes */

    h2 {
      margin: 1rem 0;
      font-size: 1.1rem;
      text-align: center;
    }

    h2 > span {
      display: block;
      line-height: normal;
    }

    h2 .highlight {
      color: var(--color-highlight);
    }

    h3 {
      margin: 0;
      font-size: 1rem;
    }

    .color-scheme {
      margin-top: 32px;
    }

    .color-scheme color-scheme {
      width: 100%;
      max-width: 336px;
      height: 75px;
      margin-top: 16px;
    }

    .color-scheme p {
      margin: 0;
    }

    @media (min-width: 900px) {
      h2 {
        margin: 2rem 0 1.5rem;
      }

      .color-scheme color-scheme {
        height: 100px;
      }
    }
  `;

  render(): TemplateResult {
    return html`
      <main>
        <div class="${classMap({ header: true, scrolled: !!this._scrolled })}">
          <div class="container">
            <h1 class="dot">Happy Colors</h1>
            <theme-switch
              theme="${this._theme}"
              @click=${toggleTheme}
            ></theme-switch>
          </div>
        </div>

        <div class="color-management">
          <h2>Pick your color</h2>

          <color-picker
            .hsv=${this.hsv}
            @changed=${this._onColorPickerChanged}
          ></color-picker>

          <h2>Save your color</h2>

          <div class="custom-color-scheme">
            ${this._savedScheme.map(
              (hex: SavedSchemeValue, index: number) => html`
                <div class="column">
                  <div
                    class="${classMap({ color: true, empty: !hex })}"
                    style="${ifDefined(
                      hex ? `background-color: #${hex}` : undefined
                    )}"
                    @click=${() => this._saveColorToCustomScheme(index)}
                  ></div>
                  <div class="hex">${hex ? `#${hex}` : ''}&nbsp;</div>
                </div>
              `
            )}
          </div>

          ${when(
            this._savedScheme.some((hex: SavedSchemeValue) => !!hex),
            () => html`
              <div class="reset-custom-color-scheme">
                <button @click=${this._clearCustomScheme}>
                  Reset color scheme
                </button>
              </div>
            `
          )}
        </div>

        <div class="color-schemes">
          <h2>
            <span>Generated schemes</span>
            <span><span class="highlight">&</span> inspiration</span>
          </h2>

          <div>
            <div class="color-scheme">
              <div>
                <h3>Monochromatic color scheme</h3>
                <p>
                  The monochromatic color scheme consists of a base color, and a
                  range of its shades.
                </p>
              </div>
              <color-scheme
                scheme="monochromatic"
                .color=${this.hsv}
                @color-scheme-selected=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>

            <div class="color-scheme">
              <div>
                <h3>Analogous color scheme</h3>
                <p>
                  The analogous color scheme adds two additional colors on the
                  color wheel: one on either side of the base color, distributed
                  evenly.
                </p>
              </div>
              <color-scheme
                scheme="analogous"
                show-hex
                .color=${this.hsv}
                @color-scheme-selected=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>

            <div class="color-scheme">
              <div>
                <h3>Complementary color scheme</h3>
                <p>
                  The complementary color scheme adds one opposite (complement)
                  color. This color is on the exact opposite side of the color
                  wheel.
                </p>
              </div>
              <color-scheme
                scheme="complementary"
                show-hex
                .color=${this.hsv}
                @color-scheme-selected=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>

            <div class="color-scheme">
              <div>
                <h3>Triadic color scheme</h3>
                <p>
                  The triadic color scheme adds two additional colors. All three
                  colors are distributed evenly around the color wheel.
                </p>
              </div>
              <color-scheme
                scheme="triadic"
                show-hex
                .color=${this.hsv}
                @color-scheme-selected=${this._onColorSchemeSelected}
              ></color-scheme>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  constructor() {
    super();

    const hsv = hsvStorage.get().data || this.hsv;
    this._setHsv(hsv);

    const scheme = colorSchemeStorage.get().data || [];
    this._savedScheme = createCustomScheme(scheme);

    this._theme = getTheme();
    this._onPageScroll = debounce(this._onPageScroll).bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    observeThemeChanges(theme => (this._theme = theme));
    window.addEventListener('scroll', this._onPageScroll);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    unobserveThemeChanges();
    window.removeEventListener('scroll', this._onPageScroll);
  }

  private _onPageScroll() {
    this._scrolled = window.pageYOffset > 0;
  }

  private _setHsv(hsv: Hsv) {
    if (hasColorChanged(hsv, this.hsv)) {
      this.hsv = validateHsv(hsv);
      hsvStorage.set(hsv);
    }
  }

  private _saveColorToCustomScheme(index: number) {
    this._savedScheme[index] = hsvToHex(this.hsv);
    this._savedScheme = [...this._savedScheme];
    colorSchemeStorage.set(this._savedScheme);
  }

  private _clearCustomScheme() {
    this._savedScheme = createCustomScheme();
    colorSchemeStorage.remove();
  }

  private _onColorPickerChanged({ detail: hsv }: CustomEvent<Hsv>) {
    this._setHsv(hsv);
  }

  private _onColorSchemeSelected({ detail: hsv }: CustomEvent<Hsv>) {
    this._setHsv(hsv);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-happy-colors': AppHappyColors;
  }
}
