import { LitElement, html, css } from 'lit-element';
import { DraggableMixin } from '../../mixins/DraggableMixin.js';
import { hsvToRgb, rgbToCssString, validateHue } from '../../utils/colors.js';
import { minMax, round } from '../../utils/numbers.js';

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
        margin: auto;
      }

      .handle::after {
        content: '';
        display: block;
        position: absolute;
        top: calc(var(--handle-size) / 2 * -1);
        left: calc(var(--handle-size) / 2 * -1);
        height: var(--handle-size);
        width: var(--handle-size);
        background-color: inherit;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 1px 1px 1px inset rgba(0, 0, 0, 0.3), 1px 1px 2px rgba(0, 0, 0, 0.3);
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
    this.createDraggableElement({
      canvas: this.shadowRoot.querySelector('.slider'),
      draggable: this.shadowRoot.querySelector('.handle'),
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

  /**
   * @public
   */
  updateHue(hue) {
    this.hue = hue;
    this.updateHandlePosition();
    this._updateColorStyling(this.hue);
  }

  /**
   * @public
   */
  updateHandlePosition() {
    const { offsetHeight } = this.elements.canvas;
    const rawY = offsetHeight - this.hue / (360 / offsetHeight);

    const y = minMax(round(rawY, 1), 0, offsetHeight);
    this.elements.draggable.style.transform = `translate(0px, ${y}px)`;
  }

  _initialize(initialHue) {
    if (!this.hue) {
      this.updateHue(initialHue);
    }
  }

  _onHandleDragged(position) {
    // Calculate the new color based on the handle position.
    const { offsetHeight } = this.elements.canvas;
    this.hue = validateHue(360 - (position.y / offsetHeight) * 360);

    this._updateColorStyling(this.hue);
    this.elements.draggable.style.transform = `translate(0px, ${position.y}px)`;
    this.dispatchEvent(new CustomEvent('changed', { detail: this.hue }));
  }

  _updateColorStyling(hue) {
    this.elements.draggable.style.backgroundColor = rgbToCssString(hsvToRgb([hue, 100, 100]));
  }
}
