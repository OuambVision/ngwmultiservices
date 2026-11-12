import type { CollectionConfig } from 'payload'

import { anyone, staff } from '../access'
import { quoteStatuses } from '../domain/statuses'
import { forcePublicStatus } from '../hooks/submissions'
import { lockedStatusField } from '../fields/common'

export const QuoteRequests: CollectionConfig = {
  slug: 'quoteRequests',
  labels: { singular: 'Soumission', plural: 'Soumissions' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'category', 'createdAt'],
    group: 'Demandes',
  },
  access: {
    create: anyone,
    read: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'email', label: 'Courriel', type: 'email', required: true },
    { name: 'phone', label: 'Téléphone', type: 'text', required: true },
    { name: 'category', label: 'Catégorie', type: 'relationship', relationTo: 'categories' },
    { name: 'need', label: 'Besoin', type: 'textarea', required: true },
    lockedStatusField(quoteStatuses, 'recue'),
  ],
  hooks: {
    beforeChange: [forcePublicStatus('recue')],
  },
}
