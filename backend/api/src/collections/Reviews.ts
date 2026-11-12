import type { CollectionConfig } from 'payload'

import { anyone, publicReadEquals, staff } from '../access'
import { reviewStatuses } from '../domain/statuses'
import { lockedStatusField } from '../fields/common'
import { forcePublicStatus, requirePublicConsent } from '../hooks/submissions'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Avis', plural: 'Avis' },
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['rating', 'status', 'service', 'createdAt'],
    group: 'Contenu',
  },
  access: {
    create: anyone,
    read: publicReadEquals('status', 'publie'),
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'rating', label: 'Note', type: 'number', required: true, min: 1, max: 5 },
    { name: 'text', label: 'Texte', type: 'textarea', required: true },
    {
      name: 'service',
      label: 'Service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
    },
    { name: 'media', label: 'Médias', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'consent',
      label: 'J’accepte que cet avis soit vérifié avant publication',
      type: 'checkbox',
      required: true,
    },
    lockedStatusField(reviewStatuses, 'en_attente'),
  ],
  hooks: {
    beforeChange: [requirePublicConsent, forcePublicStatus('en_attente')],
  },
}
