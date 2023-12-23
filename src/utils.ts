export function desensitize(value: string) {
  const s = value.replace(/(.{2}).*(.{2})/, "$1******$2");
  return s;
}
