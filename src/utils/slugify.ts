/**
 * Convert Vietnamese text to URL-safe slug
 * Removes Vietnamese accents and special characters
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Split accented letters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-'); // Multiple hyphens to one
}
