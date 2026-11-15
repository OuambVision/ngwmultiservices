/**
 * Completes missing FR/EN localized fields across catalogue content.
 * Usage: pnpm exec payload run src/scripts/fill-locales.ts
 */
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

import { localeEnMap } from './locale-en-map'

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isEmpty(value: unknown) {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).length < 40
    } catch {
      return true
    }
  }
  return false
}

const unmapped = new Set<string>()

function translateDuration(fr: string) {
  return fr
    .replace(/(\d+)\s*à\s*(\d+)\s*heures?/gi, '$1 to $2 hours')
    .replace(/(\d+)\s*à\s*(\d+)\s*minutes?/gi, '$1 to $2 minutes')
    .replace(/(\d+)\s*heures?/gi, '$1 hours')
    .replace(/(\d+)\s*minutes?/gi, '$1 minutes')
}

function translateText(fr: string): string {
  const source = fr.trim()
  if (!source) return ''
  if (localeEnMap[source]) return localeEnMap[source]
  const noPeriod = source.replace(/\.$/, '')
  if (localeEnMap[noPeriod]) return localeEnMap[noPeriod]
  if (localeEnMap[`${noPeriod}.`]) return localeEnMap[`${noPeriod}.`]
  const timed = translateDuration(source)
  if (timed !== source) return timed
  unmapped.add(source)
  return source
}

function translateRichText(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(translateRichText)
  if (!node || typeof node !== 'object') return node
  const obj = node as Record<string, unknown>
  const next: Record<string, unknown> = { ...obj }
  if (typeof obj.text === 'string' && obj.text.trim()) {
    next.text = translateText(obj.text)
  }
  if (obj.children) next.children = translateRichText(obj.children)
  if (obj.root && typeof obj.root === 'object') {
    next.root = translateRichText(obj.root)
  }
  return next
}

type Stats = { updated: number; skipped: number; fields: number }

async function fillCategories(payload: Payload, stats: Stats) {
  const docs = await payload.find({
    collection: 'categories',
    locale: 'fr',
    fallbackLocale: false,
    limit: 200,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of docs.docs) {
    const en = await payload.findByID({
      collection: 'categories',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    const data: Record<string, string> = {}
    if (text(fr.title) && !text(en.title)) {
      data.title = translateText(text(fr.title))
      stats.fields += 1
    }
    if (text(fr.description) && !text(en.description)) {
      data.description = translateText(text(fr.description))
      stats.fields += 1
    }
    if (Object.keys(data).length === 0) {
      stats.skipped += 1
      continue
    }
    await payload.update({
      collection: 'categories',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data,
    })
    stats.updated += 1
  }
}

async function fillServices(payload: Payload, stats: Stats) {
  const docs = await payload.find({
    collection: 'services',
    locale: 'fr',
    fallbackLocale: false,
    limit: 500,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of docs.docs) {
    const en = await payload.findByID({
      collection: 'services',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    const data: Record<string, unknown> = {}
    if (text(fr.title) && !text(en.title)) {
      data.title = translateText(text(fr.title))
      stats.fields += 1
    }
    if (text(fr.summary) && !text(en.summary)) {
      data.summary = translateText(text(fr.summary))
      stats.fields += 1
    }
    if (!isEmpty(fr.description) && isEmpty(en.description)) {
      data.description = translateRichText(fr.description)
      stats.fields += 1
    }
    if (text(fr.duration) && !text(en.duration)) {
      data.duration = translateDuration(text(fr.duration))
      stats.fields += 1
    }
    if (text(fr.place) && !text(en.place)) {
      data.place = translateText(text(fr.place))
      stats.fields += 1
    }
    if (text(fr.zone) && !text(en.zone)) {
      data.zone = translateText(text(fr.zone))
      stats.fields += 1
    }

    const frIncluded = fr.included ?? []
    const enIncluded = en.included ?? []
    const included = frIncluded.map((row, index) => {
      const enRow = enIncluded[index]
      const frItem = text(row.item)
      const enItem = text(enRow?.item)
      const item = frItem && !enItem ? translateText(frItem) : enItem || frItem
      if (frItem && !enItem) stats.fields += 1
      return {
        ...(row.id ? { id: row.id } : {}),
        item,
      }
    })
    if (included.some((row, index) => text(row.item) !== text(enIncluded[index]?.item))) {
      data.included = included
    }

    if (Object.keys(data).length === 0) {
      stats.skipped += 1
      continue
    }
    await payload.update({
      collection: 'services',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data,
    })
    stats.updated += 1
  }
}

async function fillRealizations(payload: Payload, stats: Stats) {
  const docs = await payload.find({
    collection: 'realizations',
    locale: 'fr',
    fallbackLocale: false,
    limit: 500,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of docs.docs) {
    const en = await payload.findByID({
      collection: 'realizations',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    const data: Record<string, unknown> = {}
    if (text(fr.title) && !text(en.title)) {
      data.title = translateText(text(fr.title))
      stats.fields += 1
    }
    if (text(fr.summary) && !text(en.summary)) {
      data.summary = translateText(text(fr.summary))
      stats.fields += 1
    }
    if (text(fr.description) && !text(en.description)) {
      data.description = translateText(text(fr.description))
      stats.fields += 1
    }
    const frDetails = fr.details ?? []
    const enDetails = en.details ?? []
    const details = frDetails.map((row, index) => {
      const enRow = enDetails[index]
      const frItem = text(row.item)
      const enItem = text(enRow?.item)
      const item = frItem && !enItem ? translateText(frItem) : enItem || frItem
      if (frItem && !enItem) stats.fields += 1
      return { ...(row.id ? { id: row.id } : {}), item }
    })
    if (details.some((row, index) => text(row.item) !== text(enDetails[index]?.item))) {
      data.details = details
    }
    if (Object.keys(data).length === 0) {
      stats.skipped += 1
      continue
    }
    await payload.update({
      collection: 'realizations',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data,
    })
    stats.updated += 1
  }
}

async function fillReviews(payload: Payload, stats: Stats) {
  const docs = await payload.find({
    collection: 'reviews',
    locale: 'fr',
    fallbackLocale: false,
    limit: 500,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of docs.docs) {
    const en = await payload.findByID({
      collection: 'reviews',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    if (!text(fr.text) || text(en.text)) {
      stats.skipped += 1
      continue
    }
    await payload.update({
      collection: 'reviews',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { text: translateText(text(fr.text)) },
    })
    stats.fields += 1
    stats.updated += 1
  }
}

async function fillMedia(payload: Payload, stats: Stats) {
  const docs = await payload.find({
    collection: 'media',
    locale: 'fr',
    fallbackLocale: false,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of docs.docs) {
    const en = await payload.findByID({
      collection: 'media',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    if (!text(fr.alt) || text(en.alt)) {
      stats.skipped += 1
      continue
    }
    await payload.update({
      collection: 'media',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { alt: translateText(text(fr.alt)) },
    })
    stats.fields += 1
    stats.updated += 1
  }
}

async function fillSiteSettings(payload: Payload, stats: Stats) {
  const fr = await payload.findGlobal({
    slug: 'siteSettings',
    locale: 'fr',
    fallbackLocale: false,
    overrideAccess: true,
  })
  const en = await payload.findGlobal({
    slug: 'siteSettings',
    locale: 'en',
    fallbackLocale: false,
    overrideAccess: true,
  })
  const data: Record<string, string> = {}
  if (text(fr.area) && !text(en.area)) {
    data.area = translateText(text(fr.area))
    stats.fields += 1
  }
  if (text(fr.homeTitle) && !text(en.homeTitle)) {
    data.homeTitle = translateText(text(fr.homeTitle))
    stats.fields += 1
  }
  if (text(fr.homeIntro) && !text(en.homeIntro)) {
    data.homeIntro = translateText(text(fr.homeIntro))
    stats.fields += 1
  }
  if (Object.keys(data).length === 0) {
    stats.skipped += 1
    return
  }
  await payload.updateGlobal({
    slug: 'siteSettings',
    locale: 'en',
    fallbackLocale: false,
    overrideAccess: true,
    data,
  })
  stats.updated += 1
}

const payload = await getPayload({ config })
const stats: Stats = { updated: 0, skipped: 0, fields: 0 }

try {
  console.log('Remplissage des locales manquantes…')
  await fillCategories(payload, stats)
  await fillServices(payload, stats)
  await fillRealizations(payload, stats)
  await fillReviews(payload, stats)
  await fillMedia(payload, stats)
  await fillSiteSettings(payload, stats)
  console.log(
    JSON.stringify(
      {
        documentsUpdated: stats.updated,
        documentsSkipped: stats.skipped,
        fieldsFilled: stats.fields,
        unmapped: [...unmapped].sort((a, b) => a.localeCompare(b, 'fr')),
      },
      null,
      2,
    ),
  )
} finally {
  await payload.destroy()
}
