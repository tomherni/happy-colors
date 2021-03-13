import {
  LitElement,
  html,
  css,
  property,
  TemplateResult,
  customElement,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';

@customElement('theme-switch')
export class ThemeSwitch extends LitElement {
  @property({ type: String })
  theme?: string;

  static styles = css`
    :host {
      display: block;
      width: 28px;
      height: 28px;
    }

    button {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: transparent;
      background-repeat: no-repeat;
      background-size: 80%;
      background-position: 50%;
      border: none;
    }

    button.switch-to-light {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" focusable="false"><path fill="%23e6a729" d="M6.30762,8.429A1.5,1.5,0,0,1,8.429,6.30762L9.934,7.81268A9.54027,9.54027,0,0,0,7.81268,9.934ZM17,6.12976V4a1.5,1.5,0,0,0-3,0V6.12976a8.73473,8.73473,0,0,1,3,0ZM6,15.5A9.52149,9.52149,0,0,1,6.12976,14H4a1.5,1.5,0,0,0,0,3H6.12976A9.52149,9.52149,0,0,1,6,15.5ZM23.18732,9.934,24.69238,8.429A1.5,1.5,0,0,0,22.571,6.30762L21.066,7.81268A9.54027,9.54027,0,0,1,23.18732,9.934ZM27,14H24.87024a8.73473,8.73473,0,0,1,0,3H27a1.5,1.5,0,0,0,0-3ZM7.81268,21.066,6.30762,22.571A1.5,1.5,0,0,0,8.429,24.69238L9.934,23.18732A9.54027,9.54027,0,0,1,7.81268,21.066Zm15.37464,0A9.54027,9.54027,0,0,1,21.066,23.18732L22.571,24.69238A1.5,1.5,0,0,0,24.69238,22.571ZM14,24.87024V27a1.5,1.5,0,0,0,3,0V24.87024a8.73473,8.73473,0,0,1-3,0ZM23,15.5A7.5,7.5,0,1,1,15.5,8,7.5082,7.5082,0,0,1,23,15.5Zm-3,0A4.5,4.5,0,1,0,15.5,20,4.50491,4.50491,0,0,0,20,15.5Z"/></svg>');
    }

    button.switch-to-dark {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" focusable="false"><path fill="%23333333" d="M25.29614,20.86829a1.04839,1.04839,0,0,0-.15277.01129A11.28987,11.28987,0,0,1,23.5,21a11.44774,11.44774,0,0,1-2.25989-.22675,11.56691,11.56691,0,0,1-9.096-9.44781,11.44715,11.44715,0,0,1,.32422-5.05811,1.01029,1.01029,0,0,0-.9494-1.30255.98825.98825,0,0,0-.40515.0885A11.99168,11.99168,0,0,0,15.16528,27.9715c.28.019.55884.0285.83478.0285a11.985,11.985,0,0,0,10.1485-5.621A.99379.99379,0,0,0,25.29614,20.86829ZM16.00006,25c-.20856,0-.41925-.00714-.63092-.02155A8.98582,8.98582,0,0,1,9.02332,10.33319q.0422.72793.15734,1.45929A14.53714,14.53714,0,0,0,20.63574,23.71179,8.93408,8.93408,0,0,1,16.00006,25Z"/></svg>');
    }
  `;

  render(): TemplateResult {
    return html`
      <button
        class="${classMap({
          'switch-to-light': this.theme === 'light',
          'switch-to-dark': this.theme === 'dark',
        })}"
        aria-label="Switch theme"
        title="Switch theme"
      ></button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-switch': ThemeSwitch;
  }
}
