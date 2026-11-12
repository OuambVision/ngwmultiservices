import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Payload } from 'payload'

import { slugify } from '../lib/slug'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const catalogueFile = path.resolve(dirname, '../../../../docs/catalogue-a-completer.csv')

type RichTextNode = {
  [key: string]: unknown
  type: string
  version: number
}

export type CatalogueReport = {
  categoriesCreated: number
  categoriesUpdated: number
  servicesCreated: number
  servicesUpdated: number
  skipped: number
}

type CatalogueRow = {
  categoryOrder?: number
  categorySlug: string
  categoryTitle: string
  description?: string
  duration?: string
  included?: string[]
  place?: string
  priceFrom?: number
  published?: boolean
  serviceOrder?: number
  serviceSlug?: string
  serviceTitle?: string
  summary?: string
  zone?: string
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const source = text.replace(/^\uFEFF/, '')

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') {
      quoted = true
    } else if (char === ';') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

function value(row: string[], index: number): string {
  return (row[index] ?? '').trim()
}

function numberValue(input: string): number | undefined {
  if (!input) return undefined
  const normalized = input.replace(/\s/g, '').replace('$', '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function publishedValue(input: string): boolean | undefined {
  const token = input.toLowerCase()
  if (['oui', 'yes', 'vrai', 'true', '1'].includes(token)) return true
  if (['non', 'no', 'faux', 'false', '0'].includes(token)) return false
  return undefined
}

function paragraph(text: string) {
  const node = (extra: RichTextNode): RichTextNode => extra
  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        node({
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          children: [
            node({
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              version: 1,
            }),
          ],
        }),
      ],
    },
  }
}

export function readCatalogue(file = catalogueFile): CatalogueRow[] {
  const table = parseCsv(readFileSync(file, 'utf8'))
  const headerIndex = table.findIndex((row) => row[0]?.trim() === 'identifiant_categorie')
  if (headerIndex < 0) {
    throw new Error('Le fichier catalogue ne contient pas la ligne d’en-têtes.')
  }

  return table.slice(headerIndex + 1).flatMap((row) => {
    const categoryTitle = value(row, 1)
    const categorySlug = slugify(value(row, 0) || categoryTitle)
    if (!categorySlug || !categoryTitle || categorySlug.startsWith('#')) return []

    const serviceTitle = value(row, 4)
    const serviceSlug = slugify(value(row, 3) || serviceTitle)
    const included = value(row, 7)
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean)

    return [
      {
        categoryOrder: numberValue(value(row, 2)),
        categorySlug,
        categoryTitle,
        description: value(row, 6) || undefined,
        duration: value(row, 8) || undefined,
        included: included.length > 0 ? included : undefined,
        place: value(row, 9) || undefined,
        priceFrom: numberValue(value(row, 11)),
        published: publishedValue(value(row, 13)),
        serviceOrder: numberValue(value(row, 12)),
        serviceSlug: serviceTitle ? serviceSlug : undefined,
        serviceTitle: serviceTitle || undefined,
        summary: value(row, 5) || undefined,
        zone: value(row, 10) || undefined,
      },
    ]
  })
}

async function findBySlug(payload: Payload, collection: 'categories' | 'services', slug: string) {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return result.docs[0]
}

function defined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, entry]) => entry !== undefined)) as Partial<T>
}

export async function importCatalogue(payload: Payload, file = catalogueFile): Promise<CatalogueReport> {
  const report: CatalogueReport = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    servicesCreated: 0,
    servicesUpdated: 0,
    skipped: 0,
  }
  const categoryIds = new Map<string, number>()

  for (const row of readCatalogue(file)) {
    let categoryId = categoryIds.get(row.categorySlug)
    if (categoryId == null) {
      const existing = await findBySlug(payload, 'categories', row.categorySlug)
      if (existing) {
        await payload.update({
          collection: 'categories',
          id: existing.id,
          overrideAccess: true,
          data: defined({ order: row.categoryOrder, title: row.categoryTitle }),
        })
        categoryId = existing.id
        report.categoriesUpdated += 1
      } else {
        const created = await payload.create({
          collection: 'categories',
          overrideAccess: true,
          data: {
            order: row.categoryOrder ?? 0,
            published: true,
            slug: row.categorySlug,
            title: row.categoryTitle,
          },
        })
        categoryId = created.id
        report.categoriesCreated += 1
      }
      categoryIds.set(row.categorySlug, categoryId)
    }

    if (!row.serviceTitle || !row.serviceSlug) {
      report.skipped += 1
      continue
    }

    const data = defined({
      category: categoryId,
      description: row.description ? paragraph(row.description) : undefined,
      duration: row.duration,
      included: row.included?.map((item) => ({ item })),
      order: row.serviceOrder,
      place: row.place,
      priceFrom: row.priceFrom,
      published: row.published,
      summary: row.summary,
      title: row.serviceTitle,
      zone: row.zone,
    })

    const existing = await findBySlug(payload, 'services', row.serviceSlug)
    if (existing) {
      await payload.update({
        collection: 'services',
        id: existing.id,
        overrideAccess: true,
        data,
      })
      report.servicesUpdated += 1
    } else {
      await payload.create({
        collection: 'services',
        overrideAccess: true,
        data: {
          ...data,
          published: row.published ?? false,
          slug: row.serviceSlug,
          title: row.serviceTitle,
          category: categoryId,
        },
      })
      report.servicesCreated += 1
    }
  }

  return report
}
