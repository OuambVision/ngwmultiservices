import type { CollectionConfig } from 'payload'

import { publicReadEquals, staff } from '../access'
import { publishedField, slugField, withSlug } from '../fields/common'

export const Realizations = withSlug({
  slug: 'realizations',
  labels: { singular: 'Réalisation', plural: 'Réalisations' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'published'],
    listSearchableFields: ['title', 'slug'],
    group: 'Contenu',
    description:
      'Filtrez par catégorie ou publication. Affichez ou masquez une réalisation depuis sa fiche.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/RealizationActions#RealizationActions'],
      },
    },
  },
  access: {
    create: staff,
    read: publicReadEquals('published', true),
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    slugField(),
    { name: 'summary', label: 'Résumé', type: 'textarea', localized: true },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Texte de la fiche. Il raconte ce qui a été fait.' },
    },
    {
      name: 'details',
      label: 'Travaux réalisés',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Détail', plural: 'Détails' },
      admin: { description: 'Liste affichée sur la fiche. Un tiret long sépare le titre du détail.' },
      fields: [{ name: 'item', label: 'Détail', type: 'text', required: true, localized: true }],
    },
    {
      name: 'category',
      label: 'Catégorie',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    {
      name: 'photos',
      label: 'Photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 5,
      admin: { description: 'Jusqu’à cinq images. La première sert de vignette.' },
    },
    {
      ...publishedField,
      label: 'Affichée sur le site',
      defaultValue: true,
      admin: {
        description: 'Décochez pour masquer cette réalisation. Une nouvelle réalisation est affichée par défaut.',
      },
    },
  ],
} satisfies CollectionConfig)
