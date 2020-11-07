export function when(condition, template) {
  return condition ? template() : undefined;
}
