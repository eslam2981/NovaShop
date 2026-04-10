/** Express 5 types route params as `string | string[]`; normalize to a single string. */
export function safeParam(value: string | string[] | undefined): string {
  if (value === undefined) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}
