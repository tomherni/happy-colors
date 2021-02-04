function wait() {
  return new Promise(resolve =>
    setTimeout(() => requestAnimationFrame(resolve))
  );
}

export async function simulateMouseEvent(
  event: string,
  element: HTMLElement,
  x: number,
  y: number
): Promise<void> {
  const { left, top } = element.getBoundingClientRect();

  element.dispatchEvent(
    new MouseEvent(event, {
      view: window,
      bubbles: true,
      composed: true,
      clientX: x + left,
      clientY: y + top,
    })
  );

  await wait();
}
