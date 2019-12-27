import { LitElement, html, css } from 'lit-element';
import { hsvToRgb, validateHsv, rgbToCssString } from '../../../utils/colors.js';
import { minMax, round } from '../../../utils/numbers.js';
import { DraggableMixin } from './draggable-mixin.js';

class ColorPalette extends DraggableMixin(LitElement) {
  static get properties() {
    return {
      ...super.properties,

      /** Initial HSV value to initialize with. */
      initial: { type: Array },

      /** Current HSV value picked in the palette canvas. */
      hsv: { type: Array },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        --handle-size: 21px;
      }

      *,
      *::after {
        box-sizing: border-box;
      }

      .palette {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .gradients {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(to right, #fff, transparent);
      }

      .gradients::after {
        content: '';
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(to top, #000, transparent);
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
        left: calc(var(--handle-size) / 2 * -1);
        width: var(--handle-size);
        height: var(--handle-size);
        background-color: inherit;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 1px 1px 1px inset rgba(0, 0, 0, 0.3), 1px 1px 2px rgba(0, 0, 0, 0.3);
      }
    `;
  }

  render() {
    return html`
      <div class="palette">
        <div class="gradients"></div>
        <div class="handle"></div>
      </div>
    `;
  }

  firstUpdated() {
    this.createDraggableElement({
      canvas: this.shadowRoot.querySelector('.palette'),
      draggable: this.shadowRoot.querySelector('.handle'),
    });
  }

  updated(props) {
    super.updated(props);

    if (props.has('initial') && this.initial) {
      this._initialize(this.initial);
    }

    if (props.has('position') && this.position) {
      this._onHandleDragged(this.position);
    }
  }

  /**
   * @public
   */
  updateHsv(hsv) {
    this.hsv = hsv;
    this.updateHandlePosition();
    this._updateColorStyling(this.hsv);
  }

  /**
   * @public
   */
  updateHandlePosition() {
    const { offsetHeight, offsetWidth } = this.elements.canvas;
    const rawX = this.hsv[1] / (100 / offsetWidth);
    const rawY = offsetHeight - this.hsv[2] / (100 / offsetHeight);

    const x = minMax(round(rawX, 1), 0, offsetWidth);
    const y = minMax(round(rawY, 1), 0, offsetHeight);
    this.elements.draggable.style.transform = `translate(${x}px, ${y}px)`;
  }

  _initialize(initialHsv) {
    if (!this.hsv) {
      this.updateHsv(initialHsv);
    }
  }

  _onHandleDragged(position) {
    const { x, y } = position;

    // Calculate the new color based on the handle position.
    const { offsetHeight, offsetWidth } = this.elements.canvas;
    const [hue] = this.hsv;
    const saturation = (x / offsetWidth) * 100;
    const value = ((offsetHeight - y) / offsetHeight) * 100;
    this.hsv = validateHsv([hue, saturation, value]);

    this._updateColorStyling(this.hsv);
    this.elements.draggable.style.transform = `translate(${x}px, ${y}px)`;
    this.dispatchEvent(new CustomEvent('changed', { detail: this.hsv }));
  }

  _updateColorStyling(hsv) {
    this.elements.canvas.style.backgroundColor = rgbToCssString(hsvToRgb([hsv[0], 100, 100]));
    this.elements.draggable.style.backgroundColor = rgbToCssString(hsvToRgb(hsv));
  }
}

window.customElements.define('color-palette', ColorPalette);
