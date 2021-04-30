const DEFAULT_THEME = 'light';
const SECONDARY_THEME = 'dark';
export type Theme = typeof DEFAULT_THEME | typeof SECONDARY_THEME;

const THEME_TARGET_ELEMENT: HTMLElement = document.documentElement;
const THEME_ATTRIBUTE = 'data-theme';
export const THEME_TRANSITION_MS = 250;

let observer: MutationObserver | undefined;

export function getTheme(): Theme {
  return THEME_TARGET_ELEMENT.getAttribute(THEME_ATTRIBUTE) as Theme;
}

// TODO: save to l.storage? but not for too long (maybe session?) because user
//   might change their OS theme later (would that matter?).
function setTheme(theme: Theme): void {
  THEME_TARGET_ELEMENT.setAttribute(THEME_ATTRIBUTE, theme);
}

export function toggleTheme(): void {
  setTheme(getTheme() === DEFAULT_THEME ? SECONDARY_THEME : DEFAULT_THEME);
}

// TODO: get from storage?
export function initializeTheme(): void {
  setTheme(
    window.matchMedia(`(prefers-color-scheme: ${SECONDARY_THEME})`).matches
      ? SECONDARY_THEME
      : DEFAULT_THEME
  );
}

export function unobserveThemeChanges(): void {
  observer?.disconnect();
  observer = undefined;
}

export function observeThemeChanges(callback?: (theme: Theme) => void): void {
  if (observer) {
    throw new Error('Already observing theme changes');
  }
  observer = new MutationObserver(() => callback?.(getTheme()));
  observer.observe(THEME_TARGET_ELEMENT, {
    attributes: true,
    attributeFilter: [THEME_ATTRIBUTE],
  });
  document.body.style.transition = `color ${THEME_TRANSITION_MS}ms, background-color ${THEME_TRANSITION_MS}ms`;
}
