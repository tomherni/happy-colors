import { LitElement, html, css } from 'lit-element';
import { DraggableMixin } from '../DraggableMixin.js';

class DraggableTest extends DraggableMixin(LitElement) {
  static styles = css`
    .canvas {
      width: 200px;
      height: 200px;
    }

    .draggable {
      width: 1px;
      height: 1px;
    }
  `;

  render() {
    return html`
      <div class="canvas">
        <div class="draggable"></div>
      </div>
    `;
  }
}

window.customElements.define('draggable-test', DraggableTest);
