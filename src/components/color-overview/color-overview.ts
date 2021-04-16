import {
  LitElement,
  html,
  css,
  property,
  internalProperty,
  TemplateResult,
  PropertyValues,
  customElement,
} from 'lit-element';
import { hasColorChanged, rgbToCssString } from '../../utils/colors.js';
import { when } from '../../utils/lit-html.js';
import { round as roundUtil } from '../../utils/numbers.js';
import { Hsv, Colors } from '../../types.js';
import '../color-picker/color-picker.js';

const round = (value: number[]) => value.map(v => roundUtil(v));

@customElement('color-overview')
export class ColorOverview extends LitElement {
  /** The currently picked color represented in the HSV color model. */
  @property({ type: Array, hasChanged: hasColorChanged })
  hsv: Hsv = [360, 100, 100];

  @internalProperty()
  private _colors?: Colors;

  static styles = css`
    :host {
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    /* TODO: can be nicer */
    color-picker {
      margin-right: 16px;
    }

    .details {
      margin-top: 16px;
    }

    .picked-color {
      height: 32px;
    }

    @media (min-width: 900px) {
      .picked-color {
        height: 48px;
      }
    }

    dl {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-row-gap: 16px;
      margin: 16px 0 0;
    }

    dt {
      margin: 0;
      font-weight: bold;
      font-size: 0.8rem;
    }

    dd {
      margin: 0;
    }
  `;

  render(): TemplateResult {
    return html`
      <color-picker
        .hsv=${this.hsv}
        @changed=${this._onPickerChanged}
      ></color-picker>

      <div class="details">
        ${when(
          this._colors,
          () => html`
            <div
              class="picked-color"
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
          `
        )}
      </div>
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('_colors')) {
      this.dispatchEvent(new CustomEvent('changed', { detail: this.hsv }));
    }
  }

  private _setColors(colors: Colors) {
    this.hsv = colors.hsv;
    this._colors = colors;
  }

  private _onPickerChanged({ detail: colors }: CustomEvent<Colors>) {
    this._setColors(colors);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-overview': ColorOverview;
  }
}
