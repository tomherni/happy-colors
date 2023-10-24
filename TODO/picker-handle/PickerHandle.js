import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

export class PickerHandle extends LitElement {
  static get properties() {
    return {
      dragging: { type: Boolean },
      _ripples: { type: Array },
    };
  }

  static get styles() {
    return css`
      :host {
        --handle-size: 21px;
        display: block;
        width: 1px;
        height: 1px;
      }

      *,
      *::after {
        box-sizing: border-box;
      }

      .handle {
        position: relative;
        background-color: inherit;
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

      .ripple {
        position: absolute;
        top: calc(var(--handle-size) / 2);
        left: calc(var(--handle-size) / 2);
        width: var(--handle-size);
        height: var(--handle-size);
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: translateX(-100%) translateY(-100%);
        animation: ripple 400ms ease-out forwards, fade 400ms ease-out forwards;
        mix-blend-mode: screen;
        pointer-events: none;
      }

      @keyframes ripple {
        0% {
          transform: translate(-100%, -100%);
        }
        80% {
          transform: translate(-100%, -100%) scale(2.5);
        }
        100% {
          transform: translate(-100%, -100%) scale(2.5);
          opacity: 0;
        }
      }

      @keyframes fade {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
    `;
  }

  render() {
    return html`
      <div class="handle">
        ${repeat(
          this._ripples,
          ripple => ripple,
          ripple => html`
            <div
              class="ripple"
              @animationend=${() => this._removeRipple(ripple)}
            ></div>
          `
        )}
      </div>
    `;
  }

  constructor() {
    super();
    this._ripples = [];
  }

  update(props) {
    if (props.has('dragging') && this.dragging) {
      this._addRipple();
    }
    super.update(props);
  }

  _addRipple() {
    const latestRipple = this._ripples.slice(-1) || 0;
    this._ripples = [...this._ripples, latestRipple + 1];
  }

  _removeRipple(ripple) {
    const index = this._ripples.indexOf(ripple);
    if (index >= 0) {
      this._ripples.splice(index, 1);
      this._ripples = [...this._ripples];
    }
  }
}
