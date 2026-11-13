import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const backupDir = path.resolve(dirname, '../../.locale-backup')
const backupPath = path.join(backupDir, 'content.json')

type Row = Record<string, unknown>
type Backup = Record<string, Row[]>

const keptColumns = new Set([
  'title',
  'summary',
  'description',
  'item',
  'duration',
  'place',
  'zone',
  'text',
  'alt',
  'area',
  'home_title',
  'home_intro',
])

const categoryTitles: Record<string, string> = {
  Automobile: 'Automotive',
  Résidentiel: 'Residential',
  Commercial: 'Commercial',
  Spécialisé: 'Specialized',
}

const serviceTitles: Record<string, string> = {
  'Lavage extérieur': 'Exterior wash',
  'Nettoyage intérieur': 'Interior cleaning',
  'Sièges et tapis': 'Seats and carpets',
  'Tableau de bord': 'Dashboard',
  'Détail complet': 'Full detail',
  'Camionnettes et VUS': 'Trucks and SUVs',
  'Maisons, appartements, condos': 'Houses, apartments and condos',
  'Grand ménage et entretien régulier': 'Deep cleaning and regular upkeep',
  'Cuisines et salles de bain': 'Kitchens and bathrooms',
  'Tapis, moquettes et meubles': 'Carpets, rugs and furniture',
  'Bureaux et salles de réunion': 'Offices and meeting rooms',
  'Commerces et institutions': 'Stores and institutions',
  'Entrepôts et espaces communs': 'Warehouses and common areas',
  'Planchers et vitres': 'Floors and windows',
  'Nettoyage après construction': 'Post-construction cleaning',
  'Nettoyage après sinistre': 'Post-disaster cleaning',
  'Désinfection et assainissement': 'Disinfection and sanitizing',
  'Service sur mesure': 'Custom service',
}

const homeTitles: Record<string, string> = {
  'Votre auto, votre maison, vos bureaux : impeccables.': 'Your car, your home, your offices: spotless.',
  'Un seul partenaire pour tous vos services.': 'One partner for all your services.',
}

const homeIntros: Record<string, string> = {
  'Un seul partenaire pour tout votre nettoyage à Ottawa et environs.':
    'One partner for all your cleaning in Ottawa and the surrounding area.',
}

const mediaAlts: Record<string, string> = {
  'hero.png': 'Car covered in foam in a wash bay',
  'hero-residentiel.png': 'Siding wash in front of a house',
  'hero-commercial.png': 'Storefront window wash',
  'hero-tapis-meuble.png': 'Carpet cleaning in a living room',
  'hero-demenagement.png': 'Sofa carried toward a truck',
  'hero-montage-installation.png': 'Furniture assembly in a living room',
  'hero-maintenance-legere.png': 'Kitchen door repair',
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isSafeStatement(sql: string) {
  const trimmed = sql.trim().toLowerCase()
  if (!trimmed) return true
  if (trimmed.startsWith('create ')) return true
  if (trimmed.startsWith('comment ')) return true
  if (trimmed.startsWith('do ')) return true
  if (/^alter table .+ add /.test(trimmed)) return true
  if (/^alter table .+ alter column /.test(trimmed)) return true
  if (/^alter table .+ drop constraint /.test(trimmed)) return true
  if (/^alter table .+ add constraint /.test(trimmed)) return true
  if (/^drop index /.test(trimmed)) return true
  const dropped = sql.match(/drop column\s+"?([a-z0-9_]+)"?/i)
  if (dropped) return keptColumns.has(dropped[1].toLowerCase())
  return false
}

async function raw(payload: Payload, sql: string) {
  const adapter = payload.db as {
    drizzle: unknown
    execute: (args: { drizzle: unknown; raw: string }) => Promise<{ rows: Row[] }>
  }
  return adapter.execute({ drizzle: adapter.drizzle, raw: sql })
}

async function tables(payload: Payload) {
  const result = await raw(
    payload,
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  )
  return result.rows.map((row) => String(row.table_name))
}

async function dump(payload: Payload): Promise<Backup> {
  const names = await tables(payload)
  const wanted = names.filter((name) =>
    /^(categories|services|realizations|reviews|media|site_settings)($|_)/.test(name),
  )
  const backup: Backup = {}
  for (const name of wanted) {
    const result = await raw(payload, `SELECT * FROM "${name}"`)
    backup[name] = result.rows
  }
  await mkdir(backupDir, { recursive: true })
  await writeFile(backupPath, JSON.stringify(backup))
  console.log(`Copie locale : ${wanted.join(', ')}.`)
  return backup
}

async function pushSchema(payload: Payload) {
  const adapter = payload.db as {
    drizzle: unknown
    schema: Record<string, unknown>
    schemaName?: string
    tablesFilter?: string[]
    extensions?: { postgis?: boolean }
    requireDrizzleKit: () => {
      pushSchema: (
        schema: Record<string, unknown>,
        drizzle: unknown,
        schemaFilters?: string[],
        tablesFilter?: string[],
        extensionsFilters?: string[],
      ) => Promise<{ hasDataLoss: boolean; warnings: string[]; statementsToExecute: string[]; apply: () => Promise<void> }>
    }
  }
  const { pushSchema: push } = adapter.requireDrizzleKit()
  const result = await push(
    adapter.schema,
    adapter.drizzle,
    adapter.schemaName ? [adapter.schemaName] : undefined,
    adapter.tablesFilter,
    adapter.extensions?.postgis ? ['postgis'] : undefined,
  )
  const unsafe = result.statementsToExecute.filter((statement) => !isSafeStatement(statement))
  if (unsafe.length > 0) {
    console.log(`Arrêt : ${unsafe.length} instruction(s) non prévue(s).`)
    console.log(unsafe.slice(0, 12).join('\n'))
    return false
  }
  console.log(
    `Schéma : ${result.statementsToExecute.length} instruction(s), avertissement(s) : ${result.warnings.length}.`,
  )
  await result.apply()
  return true
}

async function restoreFrench(payload: Payload, backup: Backup) {
  for (const row of backup.categories ?? []) {
    const title = text(row.title)
    if (!title || row.id == null) continue
    await payload.update({
      collection: 'categories',
      id: row.id as number,
      locale: 'fr',
      overrideAccess: true,
      data: { title },
    })
  }

  const includedTable = Object.keys(backup).find((name) => name.includes('included'))
  const included = includedTable ? backup[includedTable] : []
  for (const row of backup.services ?? []) {
    if (row.id == null || !text(row.title)) continue
    const id = Number(row.id)
    const items = included
      .filter((item) => Number(item._parent_id) === id)
      .sort((a, b) => Number(a._order ?? 0) - Number(b._order ?? 0))
      .flatMap((item) => (text(item.item) ? [{ item: text(item.item) }] : []))
    await payload.update({
      collection: 'services',
      id,
      locale: 'fr',
      overrideAccess: true,
      data: {
        title: text(row.title),
        summary: text(row.summary) || null,
        description: row.description ?? null,
        duration: text(row.duration) || null,
        place: text(row.place) || null,
        zone: text(row.zone) || null,
        ...(items.length > 0 ? { included: items } : {}),
      },
    })
  }

  for (const row of backup.realizations ?? []) {
    if (row.id == null) continue
    await payload.update({
      collection: 'realizations',
      id: row.id as number,
      locale: 'fr',
      overrideAccess: true,
      data: { title: text(row.title), summary: text(row.summary) || null },
    })
  }

  for (const row of backup.reviews ?? []) {
    if (row.id == null || !text(row.text)) continue
    await payload.update({
      collection: 'reviews',
      id: row.id as number,
      locale: 'fr',
      overrideAccess: true,
      data: { text: text(row.text) },
    })
  }

  for (const row of backup.media ?? []) {
    if (row.id == null || !text(row.alt)) continue
    await payload.update({
      collection: 'media',
      id: row.id as number,
      locale: 'fr',
      overrideAccess: true,
      data: { alt: text(row.alt) },
    })
  }

  const settings = backup.site_settings?.[0]
  if (settings) {
    await payload.updateGlobal({
      slug: 'siteSettings',
      locale: 'fr',
      overrideAccess: true,
      data: {
        area: text(settings.area) || undefined,
        homeTitle: text(settings.home_title) || undefined,
        homeIntro: text(settings.home_intro) || undefined,
      },
    })
  }
}

async function writeEnglish(payload: Payload, backup: Backup) {
  let written = 0
  const missing: string[] = []

  for (const row of backup.categories ?? []) {
    const english = categoryTitles[text(row.title)]
    if (!english || row.id == null) {
      if (text(row.title)) missing.push(text(row.title))
      continue
    }
    await payload.update({
      collection: 'categories',
      id: row.id as number,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { title: english },
    })
    written += 1
  }

  for (const row of backup.services ?? []) {
    const french = text(row.title)
    const english = serviceTitles[french]
    if (!english || row.id == null) {
      if (french) missing.push(french)
      continue
    }
    const id = Number(row.id)
    const current = await payload.findByID({
      collection: 'services',
      id,
      locale: 'fr',
      depth: 0,
      overrideAccess: true,
    })
    const included = (current.included ?? []).flatMap((item) =>
      item.id && item.item ? [{ id: item.id, item: item.item }] : [],
    )
    await payload.update({
      collection: 'services',
      id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: {
        title: english,
        ...(included.length > 0 ? { included } : {}),
      },
    })
    written += 1
  }

  for (const row of backup.media ?? []) {
    const english = mediaAlts[text(row.filename)]
    if (!english || row.id == null) continue
    await payload.update({
      collection: 'media',
      id: row.id as number,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { alt: english },
    })
    written += 1
  }

  const settings = backup.site_settings?.[0]
  if (settings) {
    const homeTitle = homeTitles[text(settings.home_title)]
    const homeIntro = homeIntros[text(settings.home_intro)] ?? translateIntro(text(settings.home_intro))
    const area = text(settings.area)
    await payload.updateGlobal({
      slug: 'siteSettings',
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: {
        ...(area ? { area } : {}),
        ...(homeTitle ? { homeTitle } : {}),
        ...(homeIntro ? { homeIntro } : {}),
      },
    })
    if (homeTitle || homeIntro || area) written += 1
    if (text(settings.home_title) && !homeTitle) missing.push(text(settings.home_title))
    if (text(settings.home_intro) && !homeIntro) missing.push(`intro: ${text(settings.home_intro).slice(0, 180)}`)
  }

  console.log(`Anglais : ${written} contenu(s) enregistré(s), ${missing.length} laissé(s) au français.`)
  if (missing.length > 0) console.log(missing.join(' | '))
}

function translateIntro(french: string) {
  if (!french) return ''
  if (french.startsWith('Nettoyage résidentiel')) {
    return 'Residential and commercial cleaning, maintenance, assembly and moving help. A simple, organized and professional service.'
  }
  return ''
}

const payload = await getPayload({ config })

try {
  const names = await tables(payload)
  let backup: Backup
  try {
    await access(backupPath)
    backup = JSON.parse(await readFile(backupPath, 'utf8')) as Backup
    console.log('Copie locale déjà présente.')
  } catch {
    backup = await dump(payload)
  }
  if (!names.includes('categories_locales')) {
    const applied = await pushSchema(payload)
    if (!applied) throw new Error('Schéma non appliqué.')
    await restoreFrench(payload, backup)
  }
  await writeEnglish(payload, backup)
} finally {
  await payload.destroy()
}
