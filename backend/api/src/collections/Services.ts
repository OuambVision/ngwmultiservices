import type { CollectionConfig } from 'payload'

import { publicReadEquals, staff } from '../access'
import { publishedField, slugField, withSlug } from '../fields/common'

export const Services = withSlug({
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'priceFrom', 'duration', 'order', 'published'],
    group: 'Catalogue',
    description:
      'Prix et durées des modèles Automobile viennent de la maquette. Laissez-les masqués tant qu’ils ne sont pas validés.',
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
      name: 'category',
      label: 'Catégorie',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    { name: 'summary', label: 'Résumé', type: 'textarea', localized: true },
    { name: 'description', label: 'Description', type: 'richText', localized: true },
    {
      name: 'included',
      label: 'Ce service inclut',
      type: 'array',
      labels: { singular: 'Élément', plural: 'Éléments' },
      fields: [{ name: 'item', label: 'Élément', type: 'text', required: true, localized: true }],
    },
    {
      type: 'row',
      fields: [
        { name: 'duration', label: 'Durée', type: 'text', localized: true, admin: { placeholder: '1 à 2 heures' } },
        { name: 'place', label: 'Lieu', type: 'text', localized: true },
        { name: 'zone', label: 'Zone', type: 'text', localized: true },
      ],
    },
    {
      name: 'priceFrom',
      label: 'Prix indicatif (CAD)',
      type: 'number',
      min: 0,
      admin: {
        step: 1,
        description: 'Montant « à partir de », en dollars, à faire valider avant publication.',
      },
    },
    { name: 'photo', label: 'Photo', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      label: 'Ordre',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: { description: 'Plus le nombre est petit, plus le service apparaît tôt.' },
    },
    {
      ...publishedField,
      admin: { description: 'Décocher masque le service sur le site et dans l’API publique.' },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      min: 0,
      admin: { hidden: true, disableListColumn: true },
    },
    slugField(),
  ],
} satisfies CollectionConfig)
