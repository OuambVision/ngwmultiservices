import type { CollectionConfig, TextField } from 'payload'

import { staffField } from '../access'
import { fillSlug } from '../lib/slug'

export const slugField = (): TextField => ({
  name: 'slug',
  label: 'Identifiant d’URL',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Laissé vide, il est produit à partir du titre.',
  },
  validate: (value) => (typeof value === 'string' && value.length > 0) || 'L’identifiant est requis.',
})

export const publishedField = {
  name: 'published',
  label: 'Publié',
  type: 'checkbox',
  defaultValue: false,
  index: true,
} as const

export const lockedStatusField = (
  options: ReadonlyArray<{ label: string; value: string }>,
  defaultValue: string,
) => ({
  name: 'status',
  label: 'Statut',
  type: 'select' as const,
  required: true,
  defaultValue,
  index: true,
  options: [...options],
  access: {
    create: staffField,
    update: staffField,
  },
})

export function withSlug<T extends CollectionConfig>(collection: T): T {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      beforeValidate: [
        ({ data }) => fillSlug(data),
        ...(collection.hooks?.beforeValidate ?? []),
      ],
    },
  }
}
