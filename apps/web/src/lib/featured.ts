const familyOrder = [
  'automobile',
  'residentiel',
  'commercial',
  'specialise',
  'demenagement',
  'petite-maintenance',
]

export type RatedService = {
  average: number
  categorySlug: string
  count: number
  order: number
}

/** Highest scores first. Equal scores rotate across categories before a second pick from the same one. */
export function pickTopRated<T extends RatedService>(items: T[], limit = 6): T[] {
  const sorted = [...items].sort(
    (a, b) => b.average - a.average || b.count - a.count || a.order - b.order,
  )
  const picked: T[] = []
  let index = 0
  while (picked.length < limit && index < sorted.length) {
    const head = sorted[index]
    let end = index + 1
    while (
      end < sorted.length &&
      sorted[end].average === head.average &&
      sorted[end].count === head.count
    ) {
      end += 1
    }
    const seen = new Set(picked.map((item) => item.categorySlug))
    const buckets = new Map<string, T[]>()
    for (const item of sorted.slice(index, end)) {
      const list = buckets.get(item.categorySlug) ?? []
      list.push(item)
      buckets.set(item.categorySlug, list)
    }
    const slugs = [...buckets.keys()].sort((a, b) => rank(a, seen) - rank(b, seen))
    let added = true
    while (picked.length < limit && added) {
      added = false
      for (const slug of slugs) {
        const next = buckets.get(slug)?.shift()
        if (!next) continue
        picked.push(next)
        added = true
        if (picked.length === limit) break
      }
    }
    index = end
  }
  return picked
}

function rank(slug: string, seen: Set<string>) {
  const known = familyOrder.indexOf(slug)
  return (seen.has(slug) ? 10 : 0) + (known === -1 ? 9 : known)
}
