// @ts-nocheck

import { LitElement, html, css, property, customElement } from 'lit-element';
import { hsvToRgb, rgbToCssString, hsvToHex } from '../../utils/colors.js';
import { when } from '../../utils/lit-html.js';
import {
  Hsv,
  ColorScheme as ColorSchemeType,
  ColorSchemeMono,
} from '../../types.js';
import { schemes } from './schemes.js';

@customElement('color-scheme')
export class ColorScheme extends LitElement {
  /** Base color to generate a color scheme for. */
  @property({ type: Array })
  color: Hsv;

  /** Type of color scheme to generate. */
  @property({ type: String, attribute: 'scheme' })
  scheme: string;

  /** Whether to show the color HEX code. */
  @property({ type: Boolean, attribute: 'show-hex' })
  showHex = false;

  @property()
  _colors: ColorSchemeType | ColorSchemeMono;

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

  render() {
    if (!this._colors) {
      return html``;
    }

    if (this.scheme === 'monochromatic') {
      return html`
        <div class="color-scheme sub-scheme">
          <div>${this._colorBlockTemplate(this._colors[0])}</div>

          <div>
            ${this._colors[1].map(color => this._colorBlockTemplate(color))}
          </div>
        </div>
      `;
    }

    return html`
      <div class="color-scheme">
        ${this._colors.map(color => this._colorBlockTemplate(color))}
      </div>
    `;
  }

  updated(props) {
    super.updated(props);

    if (props.has('color')) {
      this._generateColorScheme(this.color, this.scheme);
    }
  }

  _colorBlockTemplate(color) {
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

  _generateColorScheme(color, scheme) {
    const fn = schemes[scheme];
    if (!fn) {
      throw new Error(`Unknown color scheme: ${scheme})`);
    }
    this._colors = fn(color);
  }

  _onColorClick(e) {
    const { hsv } = e.composedPath()[0].dataset;
    this.dispatchEvent(
      new CustomEvent('color-scheme-selected', {
        detail: hsv.split(',').map(Number),
      })
    );
  }
}
