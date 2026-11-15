import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '@payload-config'

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function empty(value: unknown) {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  try {
    return JSON.stringify(value).length < 40
  } catch {
    return true
  }
}

function richTexts(node: unknown, out: string[]) {
  if (Array.isArray(node)) {
    for (const child of node) richTexts(child, out)
    return
  }
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  if (typeof obj.text === 'string' && obj.text.trim()) out.push(obj.text.trim())
  if (obj.children) richTexts(obj.children, out)
  if (obj.root) richTexts(obj.root, out)
}

const missing = new Set<string>()
const payload = await getPayload({ config })

try {
  const services = await payload.find({
    collection: 'services',
    locale: 'fr',
    fallbackLocale: false,
    limit: 500,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of services.docs) {
    const en = await payload.findByID({
      collection: 'services',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    for (const [frVal, enVal] of [
      [fr.title, en.title],
      [fr.summary, en.summary],
      [fr.duration, en.duration],
      [fr.place, en.place],
      [fr.zone, en.zone],
    ] as const) {
      if (text(frVal) && !text(enVal)) missing.add(text(frVal))
    }
    if (!empty(fr.description) && empty(en.description)) {
      richTexts(fr.description, [])
      const texts: string[] = []
      richTexts(fr.description, texts)
      for (const t of texts) missing.add(t)
    }
    const frInc = fr.included ?? []
    const enInc = en.included ?? []
    frInc.forEach((row, i) => {
      if (text(row.item) && !text(enInc[i]?.item)) missing.add(text(row.item))
    })
  }

  const categories = await payload.find({
    collection: 'categories',
    locale: 'fr',
    fallbackLocale: false,
    limit: 50,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of categories.docs) {
    const en = await payload.findByID({
      collection: 'categories',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    if (text(fr.title) && !text(en.title)) missing.add(text(fr.title))
    if (text(fr.description) && !text(en.description)) missing.add(text(fr.description))
  }

  const media = await payload.find({
    collection: 'media',
    locale: 'fr',
    fallbackLocale: false,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  for (const fr of media.docs) {
    const en = await payload.findByID({
      collection: 'media',
      id: fr.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    if (text(fr.alt) && !text(en.alt)) missing.add(text(fr.alt))
  }

  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.locale-backup')
  await mkdir(dir, { recursive: true })
  const list = [...missing].sort((a, b) => a.localeCompare(b, 'fr'))
  await writeFile(path.join(dir, 'missing-fr.txt'), list.join('\n'), 'utf8')
  console.log(`missing strings: ${list.length}`)
} finally {
  await payload.destroy()
}
