export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function fillSlug<T extends { slug?: unknown; title?: unknown }>(data: T | undefined): T | undefined {
  if (!data) return data
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const slug = typeof data.slug === 'string' ? data.slug.trim() : ''
  const next = slugify(slug || title)
  if (next) data.slug = next
  return data
}
