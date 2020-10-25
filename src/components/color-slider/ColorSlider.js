import { LitElement, html, css } from 'lit-element';
import { DraggableMixin } from '../../mixins/DraggableMixin.js';
import { hsvToRgb, rgbToCssString, validateHue } from '../../utils/colors.js';

export class ColorSlider extends DraggableMixin(LitElement) {
  static get properties() {
    return {
      /** Current hue value picked in the slider canvas. */
      hue: { type: Number },
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

      .slider {
        position: relative;
        width: 10px;
        height: 100%;
        background-image: linear-gradient(
          to bottom,
          rgb(255, 0, 0),
          rgb(255, 0, 255),
          rgb(0, 0, 255),
          rgb(0, 255, 255),
          rgb(0, 255, 0),
          rgb(255, 255, 0),
          rgb(255, 0, 0)
        );
        border-radius: 5px;
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
        left: calc((var(--handle-size) - 10px) / 2 * -1);
        height: var(--handle-size);
        width: var(--handle-size);
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
      <div class="slider">
        <div class="handle"></div>
      </div>
    `;
  }

  firstUpdated() {
    this._handleElement = this.shadowRoot.querySelector('.handle');

    this.registerDraggableElement({
      canvas: this.shadowRoot.querySelector('.slider'),
      draggable: this._handleElement,
      initial: this._convertHueToHandlePosition(),
      callback: this._onHandlePositionChanged.bind(this),
      lockX: true,
    });
  }

  updated(props) {
    super.updated(props);
    if (props.has('hue') && this.hue) {
      this._onHueChanged();
      this.dispatchEvent(new CustomEvent('changed', { detail: this.hue }));
    }
  }

  _setHue(hue) {
    this.hue = validateHue(hue);
  }

  _onHueChanged() {
    const newHandlePosition = this._convertHueToHandlePosition();
    this.updateDraggablePosition(newHandlePosition);
    this._updateColorStyling();
  }

  /**
   * @param {PositionCoords} position
   */
  _onHandlePositionChanged(position) {
    this._setHue(360 - (360 / 100) * position.y);
    this._updateColorStyling();
  }

  _convertHueToHandlePosition() {
    return { y: 100 - (this.hue / 360) * 100 };
  }

  _updateColorStyling() {
    this._handleElement.style.backgroundColor = rgbToCssString(
      hsvToRgb([this.hue, 100, 100])
    );
  }
}
