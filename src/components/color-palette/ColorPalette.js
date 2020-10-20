import { LitElement, html, css } from 'lit-element';
import { DraggableMixin } from '../../mixins/DraggableMixin.js';
import { hsvToRgb, validateHsv, rgbToCssString } from '../../utils/colors.js';
import { hasColorChanged } from '../color-picker/utils.js';

export class ColorPalette extends DraggableMixin(LitElement) {
  static get properties() {
    return {
      /** The current color in HSV format. */
      hsv: {
        type: Array,
        hasChanged: hasColorChanged,
      },
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
        box-shadow: 1px 1px 1px inset rgba(0, 0, 0, 0.3),
          1px 1px 2px rgba(0, 0, 0, 0.3);
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
    this._canvasElement = this.shadowRoot.querySelector('.palette');
    this._handleElement = this.shadowRoot.querySelector('.handle');

    this.registerDraggableElement({
      canvas: this._canvasElement,
      draggable: this._handleElement,
      initial: this._convertHsvToHandlePosition(),
    });
  }

  updated(props) {
    super.updated(props);

    if (props.has('hsv') && this.hsv) {
      this._onHsvChanged();
    }
    if (props.has('position') && this.position) {
      this._onHandlePositionChanged();
    }
  }

  _onHsvChanged() {
    const newHandlePosition = this._convertHsvToHandlePosition();
    this.updateDraggablePosition(newHandlePosition);
    this._updateColorStyling();
  }

  _onHandlePositionChanged() {
    this.hsv = this._convertHandlePositionToHsv();
    this._updateColorStyling();
    this.dispatchEvent(new CustomEvent('changed', { detail: this.hsv }));
  }

  _convertHsvToHandlePosition() {
    return {
      x: this.hsv[1],
      y: 100 - this.hsv[2],
    };
  }

  _convertHandlePositionToHsv() {
    const [hue] = this.hsv;
    const saturation = this.position.x;
    const value = 100 - this.position.y;
    return validateHsv([hue, saturation, value]);
  }

  _updateColorStyling() {
    this._canvasElement.style.backgroundColor = rgbToCssString(
      hsvToRgb([this.hsv[0], 100, 100])
    );
    this._handleElement.style.backgroundColor = rgbToCssString(
      hsvToRgb(this.hsv)
    );
  }
}
