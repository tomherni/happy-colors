import type { TemplateResult } from 'lit-html';

export function when(
  condition: unknown,
  template: () => TemplateResult
): TemplateResult | undefined {
  return condition ? template() : undefined;
}
