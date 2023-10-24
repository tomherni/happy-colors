import type { TemplateResult } from 'lit';
import type { Theme } from '../../utils/theme.js';

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../theme-switch/theme-switch.js';

@customElement('top-header')
export class TopHeader extends LitElement {
  /** The color scheme based on user preference. */
  @property({ type: String, attribute: 'active-theme' })
  activeTheme?: Theme;

  /** Whether to increase the depth of the header. */
  @property({ type: Boolean, attribute: 'increase-depth', reflect: true })
  increaseDepth = false;

  static styles = css`
    :host {
      display: block;
      --header-height: 52px;
    }

    @media (min-width: 900px) {
      :host {
        --header-height: 64px;
      }
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* Fixed header with title and theme switcher */

    .header {
      position: fixed;
      top: var(--offset-top);
      right: 0;
      left: 0;
      height: var(--header-height);
      background-color: var(--header-color-background);
      z-index: 1;
    }

    /* Show a shadow to increase the depth. Instead of animating the box-shadow, */
    /* animation a pseudo-element and its opacity performs better. */
    .header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      box-shadow: 0 0 8px 8px var(--header-color-shadow);
      transition: opacity 400ms;
      z-index: -1;
    }

    :host([increase-depth]) .header::after {
      opacity: 1;
    }

    .header .container {
      position: relative;
      max-width: 400px;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
      font-weight: bold;
      font-size: 1.3rem;
      line-height: var(--header-height);
      text-align: center;
    }

    theme-switch {
      position: absolute;
      top: 0;
      right: 8px;
      bottom: 0;
      margin: auto 0;
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="header">
        <div class="container">
          <h1>Happy Colors</h1>
          <theme-switch active-theme="${this.activeTheme}"></theme-switch>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'top-header': TopHeader;
  }
}
