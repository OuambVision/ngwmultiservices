import type { CollectionConfig } from 'payload'

import { anyone, publicReadEquals, staff } from '../access'
import { reviewStatuses } from '../domain/statuses'
import { submitReview } from '../endpoints/submitReview'
import { lockedStatusField } from '../fields/common'
import { forcePublicStatus, requirePublicConsent } from '../hooks/submissions'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Avis', plural: 'Avis' },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'rating', 'status', 'service', 'createdAt'],
    listSearchableFields: ['author', 'text'],
    group: 'Contenu',
    description: 'Filtrez par statut ou par service. Publiez ou refusez depuis la fiche avis.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/ReviewActions#ReviewActions'],
      },
    },
  },
  access: {
    create: anyone,
    read: publicReadEquals('status', 'publie'),
    update: staff,
    delete: staff,
  },
  fields: [
    {
      name: 'author',
      label: 'Nom affiché',
      type: 'text',
      required: true,
      admin: { description: 'Nom court affiché sur le site, par exemple Jean D.' },
    },
    { name: 'rating', label: 'Note', type: 'number', required: true, min: 1, max: 5 },
    { name: 'text', label: 'Texte', type: 'textarea', required: true, localized: true, maxLength: 500 },
    {
      name: 'service',
      label: 'Service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
    },
    {
      name: 'media',
      label: 'Médias',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 5,
      admin: { description: 'Jusqu’à cinq photos ou vidéos. 10 Mo par fichier sur le formulaire public.' },
    },
    {
      name: 'consent',
      label: 'J’accepte la vérification avant publication',
      type: 'checkbox',
      required: true,
    },
    lockedStatusField(reviewStatuses, 'en_attente'),
  ],
  hooks: {
    beforeChange: [requirePublicConsent, forcePublicStatus('en_attente')],
  },
  endpoints: [submitReview],
}
