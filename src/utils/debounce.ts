// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebounceCallback = (...args: any[]) => void;

/**
 * Debounce a function based on RAF.
 */
export function debounce<F extends DebounceCallback>(
  callback: F
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let timeout: number;

  return function debounced(
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): void {
    window.cancelAnimationFrame(timeout);
    timeout = window.requestAnimationFrame(() => callback.apply(this, args));
  };
}
