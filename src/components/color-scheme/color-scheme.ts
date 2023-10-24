import type { TemplateResult, PropertyValues } from 'lit';
import type { Hsv } from '../../types.js';
import type {
  ColorScheme as ColorSchemeType,
  ColorSchemeMono,
} from './types.js';

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { hsvToRgb, hsvToHex, rgbToCssString } from '../../utils/colors.js';
import { getColorScheme } from './schemes.js';

@customElement('color-scheme')
export class ColorScheme extends LitElement {
  /** Base color to generate a color scheme for. */
  @property({ type: Array })
  color!: Hsv;

  /** Type of color scheme to generate. */
  @property({ type: String, attribute: 'scheme' })
  scheme!: string;

  /** Whether to show the color HEX code. */
  @property({ type: Boolean, attribute: 'show-hex' })
  showHex = false;

  @state()
  private _colors?: ColorSchemeType | ColorSchemeMono;

  static styles = css`
    :host {
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .color-scheme {
      display: flex;
      height: 100%;
    }

    .color {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      position: relative;
      cursor: pointer;
    }

    .block {
      flex: 1 1 auto;
      border: 1px solid #000;
    }

    .color + .color .block {
      border-left: none;
    }

    .code {
      flex: 0 0 auto;
    }

    .code span {
      position: absolute;
      font-size: 18px;
    }

    /* Special layout for a color scheme containing a sub-scheme */

    .color-scheme.sub-scheme {
      flex-direction: column;
    }

    .color-scheme.sub-scheme > div:nth-child(1) {
      flex: 5 5 auto;
      display: flex;
    }

    .color-scheme.sub-scheme > div:nth-child(2) {
      flex: 2 2 auto;
      display: flex;
    }

    .color-scheme.sub-scheme > div:nth-child(2) .block {
      border-top: none;
    }
  `;

  render(): TemplateResult {
    if (this.scheme === 'monochromatic') {
      const colors = this._colors as ColorSchemeMono;

      return html`
        <div class="color-scheme sub-scheme">
          <div>${this._colorBlockTemplate(colors[0])}</div>

          <div>
            ${colors[1].map((color: Hsv) => this._colorBlockTemplate(color))}
          </div>
        </div>
      `;
    }

    return html`
      <div class="color-scheme">
        ${(this._colors as ColorSchemeType).map((color: Hsv) =>
          this._colorBlockTemplate(color)
        )}
      </div>
    `;
  }

  update(changedProperties: PropertyValues): void {
    if (changedProperties.has('color')) {
      this._generateColorScheme(this.color, this.scheme);
    }
    super.update(changedProperties);
  }

  private _colorBlockTemplate(color: Hsv) {
    return html`
      <div class="color">
        <div
          class="block"
          style="background-color: ${rgbToCssString(hsvToRgb(color))}"
          data-hsv="${color.join(',')}"
          @click=${this._onColorClick}
        ></div>

        ${when(
          this.showHex,
          () => html`
            <div class="code">
              <span>#${hsvToHex(color)}</span>
              &nbsp;
            </div>
          `
        )}
      </div>
    `;
  }

  private _generateColorScheme(color: Hsv, scheme: string) {
    const fn = getColorScheme(scheme);
    if (!fn) {
      throw new Error(`Unknown color scheme: ${scheme})`);
    }
    this._colors = fn(color);
  }

  private _onColorClick(event: Event) {
    const { hsv } = (event.composedPath()[0] as HTMLDivElement).dataset;
    this.dispatchEvent(
      new CustomEvent('color-scheme-selected', {
        detail: hsv!.split(',').map(Number),
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-scheme': ColorScheme;
  }
}
