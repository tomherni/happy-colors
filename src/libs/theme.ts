export type Theme = 'light' | 'dark';

const THEME_TARGET_ELEMENT = document.documentElement;
const THEME_ATTRIBUTE = 'data-theme';

let observer: MutationObserver;

export function getTheme(): Theme {
  return THEME_TARGET_ELEMENT.getAttribute(THEME_ATTRIBUTE) as Theme;
}

// TODO: save to l.storage? but not for too long (maybe session?) because user
//   might change their OS theme later (would that matter?).
function setTheme(theme: Theme): void {
  THEME_TARGET_ELEMENT.setAttribute(THEME_ATTRIBUTE, theme);
}

export function toggleTheme(): void {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

// TODO: get from storage?
export function initializeTheme(): void {
  setTheme(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
}

export function unobserveThemeChanges(): void {
  observer?.disconnect();
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
}
