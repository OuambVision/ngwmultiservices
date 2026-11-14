import type { CollectionConfig } from 'payload'

import { anyone, staff } from '../access'
import { quoteStatuses } from '../domain/statuses'
import { sendQuoteEmail } from '../hooks/quoteEmail'
import { forcePublicStatus } from '../hooks/submissions'
import { lockedStatusField } from '../fields/common'

export const QuoteRequests: CollectionConfig = {
  slug: 'quoteRequests',
  labels: { singular: 'Devis', plural: 'Demandes de devis' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'category', 'other', 'createdAt'],
    listSearchableFields: ['name', 'email', 'phone'],
    group: 'Demandes',
    description:
      'Filtrez par statut ou par catégorie. Ouvrez une demande pour la traiter ou l’annuler.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/QuoteActions#QuoteActions'],
      },
    },
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
    { name: 'phone', label: 'Téléphone', type: 'text' },
    {
      name: 'category',
      label: 'Catégorie',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
    },
    {
      name: 'other',
      label: 'Autre',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Le client n’a pas trouvé sa catégorie dans la liste.' },
    },
    { name: 'need', label: 'Besoin', type: 'textarea', required: true },
    lockedStatusField(quoteStatuses, 'recue'),
  ],
  hooks: {
    beforeChange: [forcePublicStatus('recue')],
    afterChange: [sendQuoteEmail],
  },
}
