function normalizeWhitespace(value) {
  return value.replace(/\u00a0/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export function normalizeTeaContent(input) {
  if (typeof input === 'string') {
    return normalizeWhitespace(input);
  }

  if (Array.isArray(input)) {
    return input.map(normalizeTeaContent);
  }

  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, normalizeTeaContent(value)]),
    );
  }

  return input;
}
