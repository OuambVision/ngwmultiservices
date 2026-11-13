import type { CollectionConfig } from 'payload'

import { publicReadEquals, staff } from '../access'
import { publishedField, slugField, withSlug } from '../fields/common'

export const Realizations = withSlug({
  slug: 'realizations',
  labels: { singular: 'Réalisation', plural: 'Réalisations' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'published'],
    group: 'Contenu',
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
      name: 'category',
      label: 'Catégorie',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    { name: 'media', label: 'Média', type: 'upload', relationTo: 'media' },
    publishedField,
  ],
} satisfies CollectionConfig)
