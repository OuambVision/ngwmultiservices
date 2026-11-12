import type { CollectionConfig } from 'payload'

import { publicReadEquals, staff } from '../access'
import { publishedField, slugField, withSlug } from '../fields/common'

export const Categories = withSlug({
  slug: 'categories',
  labels: { singular: 'Catégorie', plural: 'Catégories' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'published'],
    group: 'Catalogue',
    description: 'Les quatre familles du site. Le plus petit ordre s’affiche en premier.',
  },
  access: {
    create: staff,
    read: publicReadEquals('published', true),
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    slugField(),
    {
      name: 'order',
      label: 'Ordre',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: { description: 'Plus le nombre est petit, plus la catégorie apparaît tôt.' },
    },
    {
      ...publishedField,
      admin: { description: 'Décocher retire la catégorie du site.' },
    },
  ],
} satisfies CollectionConfig)
