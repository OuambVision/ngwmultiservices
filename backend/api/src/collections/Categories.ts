import type { CollectionConfig } from 'payload'

import { publicReadEquals, staff } from '../access'
import { publishedField, slugField, withSlug } from '../fields/common'

export const Categories = withSlug({
  slug: 'categories',
  labels: { singular: 'Catégorie', plural: 'Catégories' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'image', 'order', 'published'],
    listSearchableFields: ['title', 'slug'],
    group: 'Catalogue',
    description: 'Les familles du site. Le plus petit ordre s’affiche en premier. Filtrez par publication.',
  },
  access: {
    create: staff,
    read: publicReadEquals('published', true),
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Texte d’introduction affiché sur la page de la famille.' },
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image du bandeau, affichée à droite du titre.' },
    },
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
