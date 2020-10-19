import { LitElement, html, css } from 'lit-element';
import { DraggableMixin } from '../../mixins/DraggableMixin.js';
import { hsvToRgb, rgbToCssString, validateHue } from '../../utils/colors.js';

export class ColorSlider extends DraggableMixin(LitElement) {
  static get properties() {
    return {
      ...super.properties,

      /** Initial hue value to initialize with. */
      initial: { type: Number },

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

  constructor() {
    super();
    this.addEventListener('update-hue', e => this._updateHue(e.detail));
  }

  firstUpdated() {
    this._handleElement = this.shadowRoot.querySelector('.handle');

    this.registerDraggableElement({
      canvas: this.shadowRoot.querySelector('.slider'),
      draggable: this._handleElement,
      initial: this._getHandleAxisPercentage(),
      lockX: true,
    });
  }

  updated(props) {
    super.updated(props);

    if (props.has('initial') && typeof this.initial === 'number') {
      this._initialize(this.initial);
    }

    if (props.has('position') && this.position) {
      this._onHandleDragged(this.position);
    }
  }

  _updateHue(hue) {
    this.hue = hue;
    this.updateDraggablePosition(this._getHandleAxisPercentage());
    this._updateColorStyling(this.hue);
  }

  _initialize(initialHue) {
    if (!this.hue) {
      this._updateHue(initialHue);
    }
  }

  _getHandleAxisPercentage() {
    return {
      y: 100 - (this.hue / 360) * 100,
    };
  }

  _onHandleDragged({ y }) {
    // Calculate the new color based on the handle position.
    this.hue = validateHue(360 - (360 / 100) * y);

    this._updateColorStyling(this.hue);
    this.dispatchEvent(new CustomEvent('changed', { detail: this.hue }));
  }

  _updateColorStyling(hue) {
    this._handleElement.style.backgroundColor = rgbToCssString(
      hsvToRgb([hue, 100, 100])
    );
  }
}
