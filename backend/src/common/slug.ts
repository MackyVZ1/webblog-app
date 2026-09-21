export function createSlug(value: string) {
  const slug = value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
  return slug || `story-${Date.now()}`;
}

