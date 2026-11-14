import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ExcelJS, { type CellValue } from 'exceljs'
import type { Payload } from 'payload'

import { slugify } from '../lib/slug'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const catalogueFile = path.resolve(dirname, '../../../../docs/catalogue-a-completer.xlsx')

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

function cellText(value: CellValue): string {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim()
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'object' && 'richText' in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text).join('').trim()
  }
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') return value.text.trim()
  if (typeof value === 'object' && 'result' in value) return cellText(value.result)
  return ''
}

function normalizeHeading(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export async function readCatalogue(file = catalogueFile): Promise<CatalogueRow[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file)
  const sheet = workbook.getWorksheet('Catalogue')
  if (!sheet) throw new Error('La feuille Catalogue est absente du classeur.')

  const headerRow = sheet.getRow(1)
  const columns = new Map<string, number>()
  headerRow.eachCell((cell, column) => {
    columns.set(normalizeHeading(cellText(cell.value)), column)
  })

  const column = (name: string) => {
    const index = columns.get(name)
    if (!index) throw new Error(`La colonne « ${name} » est absente.`)
    return index
  }

  const categorySlugColumn = column('identifiant categorie')
  const categoryTitleColumn = column('categorie')
  const categoryOrderColumn = column('ordre categorie')
  const serviceSlugColumn = column('identifiant service')
  const serviceTitleColumn = column('service')
  const summaryColumn = column('resume')
  const descriptionColumn = column('description')
  const includedColumn = column('inclus')
  const durationColumn = column('duree')
  const placeColumn = column('lieu')
  const zoneColumn = column('zone')
  const priceColumn = column('prix indicatif cad')
  const serviceOrderColumn = column('ordre du service')
  const publishedColumn = column('publier')

  const rows: CatalogueRow[] = []
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber)
    const categoryTitle = cellText(row.getCell(categoryTitleColumn).value)
    const categorySlug = slugify(cellText(row.getCell(categorySlugColumn).value) || categoryTitle)
    if (!categorySlug || !categoryTitle) continue

    const serviceTitle = cellText(row.getCell(serviceTitleColumn).value)
    const serviceSlug = slugify(cellText(row.getCell(serviceSlugColumn).value) || serviceTitle)
    const included = cellText(row.getCell(includedColumn).value)
      .split(/\r?\n|\|/)
      .map((item) => item.trim())
      .filter(Boolean)

    rows.push({
      categoryOrder: numberValue(cellText(row.getCell(categoryOrderColumn).value)),
      categorySlug,
      categoryTitle,
      description: cellText(row.getCell(descriptionColumn).value) || undefined,
      duration: cellText(row.getCell(durationColumn).value) || undefined,
      included: included.length > 0 ? included : undefined,
      place: cellText(row.getCell(placeColumn).value) || undefined,
      priceFrom: numberValue(cellText(row.getCell(priceColumn).value)),
      published: publishedValue(cellText(row.getCell(publishedColumn).value)),
      serviceOrder: numberValue(cellText(row.getCell(serviceOrderColumn).value)),
      serviceSlug: serviceTitle ? serviceSlug : undefined,
      serviceTitle: serviceTitle || undefined,
      summary: cellText(row.getCell(summaryColumn).value) || undefined,
      zone: cellText(row.getCell(zoneColumn).value) || undefined,
    })
  }

  return rows
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

  for (const row of await readCatalogue(file)) {
    let categoryId = categoryIds.get(row.categorySlug)
    if (categoryId == null) {
      const existing = await findBySlug(payload, 'categories', row.categorySlug)
      if (existing) {
        await payload.update({
          collection: 'categories',
          id: existing.id,
          overrideAccess: true,
          data: defined({ order: row.categoryOrder }),
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
