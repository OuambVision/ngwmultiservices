import { getPayload } from 'payload'
import config from '@payload-config'

function text(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (value == null) return ''
  return String(value).trim()
}

function richTextEmpty(value: unknown) {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  try {
    return JSON.stringify(value).length < 40
  } catch {
    return true
  }
}

type Gap = { collection: string; id: string | number; field: string; missing: 'fr' | 'en'; fr?: string; en?: string }

const gaps: Gap[] = []

function compareField(
  collection: string,
  id: string | number,
  field: string,
  frValue: unknown,
  enValue: unknown,
  opts?: { rich?: boolean },
) {
  const fr = opts?.rich ? (richTextEmpty(frValue) ? '' : 'rich') : text(frValue)
  const en = opts?.rich ? (richTextEmpty(enValue) ? '' : 'rich') : text(enValue)
  if (fr && !en) gaps.push({ collection, id, field, missing: 'en', fr: opts?.rich ? '[richText]' : fr })
  if (en && !fr) gaps.push({ collection, id, field, missing: 'fr', en: opts?.rich ? '[richText]' : en })
}

const payload = await getPayload({ config })

try {
  const categories = await payload.find({
    collection: 'categories',
    locale: 'all',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  for (const doc of categories.docs) {
    const title = doc.title as unknown as { fr?: string; en?: string }
    const description = doc.description as unknown as { fr?: string; en?: string }
    compareField('categories', doc.id, 'title', title?.fr, title?.en)
    compareField('categories', doc.id, 'description', description?.fr, description?.en)
  }

  const services = await payload.find({
    collection: 'services',
    locale: 'all',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  for (const doc of services.docs) {
    const title = doc.title as unknown as { fr?: string; en?: string }
    const summary = doc.summary as unknown as { fr?: string; en?: string }
    const description = doc.description as unknown as { fr?: string; en?: string }
    const duration = doc.duration as unknown as { fr?: string; en?: string }
    const place = doc.place as unknown as { fr?: string; en?: string }
    const zone = doc.zone as unknown as { fr?: string; en?: string }
    compareField('services', doc.id, 'title', title?.fr, title?.en)
    compareField('services', doc.id, 'summary', summary?.fr, summary?.en)
    compareField('services', doc.id, 'description', description?.fr, description?.en, { rich: true })
    compareField('services', doc.id, 'duration', duration?.fr, duration?.en)
    compareField('services', doc.id, 'place', place?.fr, place?.en)
    compareField('services', doc.id, 'zone', zone?.fr, zone?.en)
    const included = (doc.included ?? []) as Array<{ id?: string; item?: { fr?: string; en?: string } }>
    included.forEach((row, index) => {
      compareField('services', doc.id, `included[${index}].item`, row.item?.fr, row.item?.en)
    })
  }

  const realizations = await payload.find({
    collection: 'realizations',
    locale: 'all',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  for (const doc of realizations.docs) {
    const title = doc.title as unknown as { fr?: string; en?: string }
    const summary = doc.summary as unknown as { fr?: string; en?: string }
    const description = doc.description as unknown as { fr?: string; en?: string }
    compareField('realizations', doc.id, 'title', title?.fr, title?.en)
    compareField('realizations', doc.id, 'summary', summary?.fr, summary?.en)
    compareField('realizations', doc.id, 'description', description?.fr, description?.en)
    const details = (doc.details ?? []) as Array<{ id?: string; item?: { fr?: string; en?: string } }>
    details.forEach((row, index) => {
      compareField('realizations', doc.id, `details[${index}].item`, row.item?.fr, row.item?.en)
    })
  }

  const reviews = await payload.find({
    collection: 'reviews',
    locale: 'all',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  for (const doc of reviews.docs) {
    const reviewText = doc.text as unknown as { fr?: string; en?: string }
    compareField('reviews', doc.id, 'text', reviewText?.fr, reviewText?.en)
  }

  const media = await payload.find({
    collection: 'media',
    locale: 'all',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  for (const doc of media.docs) {
    const alt = doc.alt as unknown as { fr?: string; en?: string }
    // Only flag if one locale has alt and the other doesn't
    compareField('media', doc.id, 'alt', alt?.fr, alt?.en)
  }

  const settings = await payload.findGlobal({
    slug: 'siteSettings',
    locale: 'all',
    overrideAccess: true,
  })
  const area = settings.area as unknown as { fr?: string; en?: string }
  const homeTitle = settings.homeTitle as unknown as { fr?: string; en?: string }
  const homeIntro = settings.homeIntro as unknown as { fr?: string; en?: string }
  compareField('siteSettings', 'global', 'area', area?.fr, area?.en)
  compareField('siteSettings', 'global', 'homeTitle', homeTitle?.fr, homeTitle?.en)
  compareField('siteSettings', 'global', 'homeIntro', homeIntro?.fr, homeIntro?.en)

  console.log(
    JSON.stringify(
      {
        counts: {
          categories: categories.totalDocs,
          services: services.totalDocs,
          realizations: realizations.totalDocs,
          reviews: reviews.totalDocs,
          media: media.totalDocs,
        },
        gaps: gaps.length,
        items: gaps,
      },
      null,
      2,
    ),
  )
} finally {
  await payload.destroy()
}
