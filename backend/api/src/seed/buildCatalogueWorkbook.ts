import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ExcelJS from 'exceljs'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const output = path.resolve(dirname, '../../../../docs/catalogue-a-completer.xlsx')

type ServiceRow = {
  categoryOrder: number
  categorySlug: string
  categoryTitle: string
  description?: string
  duration?: string
  included?: string[]
  place?: string
  priceFrom?: number
  publish: 'oui' | 'non'
  serviceOrder?: number
  serviceSlug?: string
  serviceTitle?: string
  summary?: string
  zone?: string
}

const place = 'Chez vous ou à notre emplacement'
const zone = 'Ottawa et environs'

const rows: ServiceRow[] = [
  {
    categorySlug: 'automobile',
    categoryTitle: 'Automobile',
    categoryOrder: 1,
    serviceSlug: 'lavage-exterieur',
    serviceTitle: 'Lavage extérieur',
    summary: 'Nettoyage complet de la carrosserie avec des produits de qualité.',
    description:
      'Un nettoyage complet de la carrosserie pour un véhicule propre et éclatant. Nous utilisons des produits de qualité et des techniques professionnelles pour éliminer la saleté, la poussière et les résidus de la route, tout en protégeant la peinture de votre véhicule.',
    included: [
      'Pré-lavage — élimination des saletés et poussières',
      'Lavage complet de la carrosserie — avec des produits de qualité professionnelle',
      'Nettoyage des roues et pneus — dégraissage et finition des jantes',
      'Séchage et finition — pour une brillance sans traces',
      'Produits professionnels — sécuritaires pour votre véhicule',
    ],
    duration: '1 à 2 heures',
    place,
    zone,
    priceFrom: 40,
    serviceOrder: 1,
    publish: 'non',
  },
  {
    categorySlug: 'automobile',
    categoryTitle: 'Automobile',
    categoryOrder: 1,
    serviceSlug: 'nettoyage-interieur',
    serviceTitle: 'Nettoyage intérieur',
    summary: 'Aspiration, nettoyage des surfaces et désinfection.',
    duration: '1 à 2 heures',
    place,
    zone,
    priceFrom: 60,
    serviceOrder: 2,
    publish: 'non',
  },
  {
    categorySlug: 'automobile',
    categoryTitle: 'Automobile',
    categoryOrder: 1,
    serviceSlug: 'sieges-et-tapis',
    serviceTitle: 'Sièges et tapis',
    summary: 'Nettoyage en profondeur des sièges, tapis et moquettes.',
    duration: '1 à 2 heures',
    place,
    zone,
    priceFrom: 80,
    serviceOrder: 3,
    publish: 'non',
  },
  {
    categorySlug: 'automobile',
    categoryTitle: 'Automobile',
    categoryOrder: 1,
    serviceSlug: 'tableau-de-bord',
    serviceTitle: 'Tableau de bord',
    summary: 'Nettoyage et protection des surfaces intérieures.',
    duration: '30 minutes',
    place,
    zone,
    priceFrom: 30,
    serviceOrder: 4,
    publish: 'non',
  },
  {
    categorySlug: 'automobile',
    categoryTitle: 'Automobile',
    categoryOrder: 1,
    serviceSlug: 'detail-complet',
    serviceTitle: 'Détail complet',
    summary: 'Service complet intérieur et extérieur pour un résultat impeccable.',
    duration: '3 à 5 heures',
    place,
    zone,
    priceFrom: 120,
    serviceOrder: 5,
    publish: 'non',
  },
  {
    categorySlug: 'automobile',
    categoryTitle: 'Automobile',
    categoryOrder: 1,
    serviceSlug: 'camionnettes-et-vus',
    serviceTitle: 'Camionnettes et VUS',
    summary: 'Adapté aux grands véhicules, avec une attention aux détails.',
    duration: '2 à 4 heures',
    place,
    zone,
    priceFrom: 100,
    serviceOrder: 6,
    publish: 'non',
  },
  blank('automobile', 'Automobile', 1),
  service('residentiel', 'Résidentiel', 2, 'maisons-appartements-condos', 'Maisons, appartements, condos', 1),
  service('residentiel', 'Résidentiel', 2, 'grand-menage-et-entretien-regulier', 'Grand ménage et entretien régulier', 2),
  service('residentiel', 'Résidentiel', 2, 'cuisines-et-salles-de-bain', 'Cuisines et salles de bain', 3),
  service('residentiel', 'Résidentiel', 2, 'tapis-moquettes-et-meubles', 'Tapis, moquettes et meubles', 4),
  blank('residentiel', 'Résidentiel', 2),
  service('commercial', 'Commercial', 3, 'bureaux-et-salles-de-reunion', 'Bureaux et salles de réunion', 1),
  service('commercial', 'Commercial', 3, 'commerces-et-institutions', 'Commerces et institutions', 2),
  service('commercial', 'Commercial', 3, 'entrepots-et-espaces-communs', 'Entrepôts et espaces communs', 3),
  service('commercial', 'Commercial', 3, 'planchers-et-vitres', 'Planchers et vitres', 4),
  blank('commercial', 'Commercial', 3),
  service('specialise', 'Spécialisé', 4, 'nettoyage-apres-construction', 'Nettoyage après construction', 1),
  service('specialise', 'Spécialisé', 4, 'nettoyage-apres-sinistre', 'Nettoyage après sinistre', 2),
  service('specialise', 'Spécialisé', 4, 'desinfection-et-assainissement', 'Désinfection et assainissement', 3),
  service('specialise', 'Spécialisé', 4, 'service-sur-mesure', 'Service sur mesure', 4),
  blank('specialise', 'Spécialisé', 4),
]

function service(
  categorySlug: string,
  categoryTitle: string,
  categoryOrder: number,
  serviceSlug: string,
  serviceTitle: string,
  serviceOrder: number,
): ServiceRow {
  return {
    categoryOrder,
    categorySlug,
    categoryTitle,
    publish: 'non',
    serviceOrder,
    serviceSlug,
    serviceTitle,
    zone,
  }
}

function blank(categorySlug: string, categoryTitle: string, categoryOrder: number): ServiceRow {
  return { categoryOrder, categorySlug, categoryTitle, publish: 'non', zone }
}

const headers = [
  'Identifiant catégorie',
  'Catégorie',
  'Ordre catégorie',
  'Identifiant service',
  'Service',
  'Résumé',
  'Description',
  'Inclus',
  'Durée',
  'Lieu',
  'Zone',
  'Prix indicatif (CAD)',
  'Ordre du service',
  'Publier',
]

const widths = [26, 18, 18, 38, 40, 62, 78, 62, 18, 38, 24, 22, 18, 14]
const idColumns = new Set([1, 4])
const completeColumns = new Set([5, 6, 7, 8, 9, 10, 12])

function paint(cell: ExcelJS.Cell, argb: string) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

const workbook = new ExcelJS.Workbook()
workbook.creator = 'NGW'
workbook.title = 'Catalogue NGW à compléter'

const guide = workbook.addWorksheet('Mode d’emploi', { views: [{ showGridLines: false }] })
guide.getColumn(1).width = 118
const lines = [
  'Catalogue NGW à compléter',
  '',
  'La feuille Catalogue contient une ligne par service. Les textes déjà inscrits viennent des maquettes.',
  'Les cases jaunes sont à remplir. Les cases grises sont des identifiants : ne les modifiez pas.',
  'Changer un prix, une durée ou un texte met à jour la fiche existante. Une nouvelle fiche n’est créée que si l’identifiant du service est vide.',
  'Une case laissée vide ne supprime pas une information déjà enregistrée.',
  'Dans Inclus, passez à la ligne entre chaque élément avec Alt+Entrée.',
  'Publier : choisissez oui seulement quand le prix est confirmé. non garde le service masqué sur le site.',
  'Pour ajouter un service, copiez une ligne de la même catégorie, effacez l’identifiant du service, puis inscrivez le nom.',
  'Renvoyez ce classeur Excel tel quel.',
]
lines.forEach((line, index) => {
  const cell = guide.getCell(index + 1, 1)
  cell.value = line
  cell.alignment = { wrapText: true, vertical: 'middle' }
  cell.font = { name: 'Calibri', size: index === 0 ? 18 : 12, bold: index === 0, color: { argb: index === 0 ? 'FF071B4B' : 'FF1F2937' } }
  guide.getRow(index + 1).height = index === 0 ? 28 : 22
})

const sheet = workbook.addWorksheet('Catalogue', {
  views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
})
sheet.addRow(headers)
sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } }
sheet.getRow(1).height = 24
headers.forEach((_, index) => {
  const cell = sheet.getRow(1).getCell(index + 1)
  cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  paint(cell, 'FF071B4B')
  cell.alignment = { vertical: 'middle', wrapText: true }
  sheet.getColumn(index + 1).width = widths[index]
})

rows.forEach((row) => {
  const excelRow = sheet.addRow([
    row.categorySlug,
    row.categoryTitle,
    row.categoryOrder,
    row.serviceSlug ?? '',
    row.serviceTitle ?? '',
    row.summary ?? '',
    row.description ?? '',
    row.included?.join('\n') ?? '',
    row.duration ?? '',
    row.place ?? '',
    row.zone ?? '',
    row.priceFrom ?? '',
    row.serviceOrder ?? '',
    row.publish,
  ])
  excelRow.height = row.included ? 78 : 36
  excelRow.eachCell({ includeEmpty: true }, (cell, column) => {
    cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1F2937' } }
    cell.alignment = { vertical: 'top', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    }
    const empty = cell.value == null || cell.value === ''
    if (idColumns.has(column)) paint(cell, 'FFF1F5F9')
    else if (completeColumns.has(column) && empty) paint(cell, 'FFFFF4CC')
    else paint(cell, 'FFFFFFFF')
  })
})

for (let rowNumber = 2; rowNumber <= 80; rowNumber += 1) {
  sheet.getCell(rowNumber, 14).dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"oui,non"'],
    showErrorMessage: true,
    errorTitle: 'Publier',
    error: 'Choisissez oui ou non.',
  }
}

await workbook.xlsx.writeFile(output)
console.log(output)
