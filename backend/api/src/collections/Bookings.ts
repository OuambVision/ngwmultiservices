import { ValidationError, type CollectionConfig } from 'payload'

import { anyone, staff, staffField } from '../access'
import { bookingStatuses } from '../domain/statuses'
import { sendBookingEmail } from '../hooks/bookingEmail'
import { rejectTakenSlot } from '../hooks/confirmBooking'
import { assignReference } from '../hooks/reference'
import { forcePublicStatus } from '../hooks/submissions'
import { lockedStatusField } from '../fields/common'
import { TIME } from '../lib/calendar'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Réservation', plural: 'Réservations' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'date', 'time', 'location', 'name', 'service'],
    listSearchableFields: ['reference', 'name', 'email', 'phone'],
    group: 'Demandes',
    description:
      'Filtrez par statut ou par service. Ouvrez une demande pour Confirmer ou Annuler en un clic.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/BookingActions#BookingActions'],
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
    {
      name: 'reference',
      label: 'Référence',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Produite par le serveur à la création.' },
      access: { create: staffField, update: staffField },
    },
    {
      name: 'service',
      label: 'Service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' } },
    },
    {
      name: 'time',
      label: 'Heure',
      type: 'text',
      required: true,
      index: true,
      validate: (value: unknown) =>
        (typeof value === 'string' && TIME.test(value)) || 'Heure au format HH:mm.',
    },
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'email', label: 'Courriel', type: 'email', required: true },
    { name: 'phone', label: 'Téléphone', type: 'text' },
    {
      name: 'location',
      label: 'Emplacement',
      type: 'select',
      required: true,
      options: [
        { label: 'Chez le client', value: 'client' },
        { label: 'Chez NGW', value: 'ngw' },
      ],
      admin: { description: 'Où le service sera réalisé.' },
    },
    {
      name: 'address',
      label: 'Adresse du service',
      type: 'textarea',
      admin: {
        condition: (data) => data.location === 'client',
        description: 'Requise lorsque le service a lieu chez le client.',
      },
    },
    { name: 'note', label: 'Note', type: 'textarea' },
    lockedStatusField(bookingStatuses, 'en_attente'),
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data || (data.location !== 'client' && data.location !== 'ngw')) return data
        const address = typeof data.address === 'string' ? data.address.trim() : ''
        if (data.location === 'ngw') {
          data.address = address
          return data
        }
        if (!address) {
          throw new ValidationError({
            collection: 'bookings',
            errors: [
              {
                message: 'L’adresse est requise lorsque le service a lieu chez le client.',
                path: 'address',
              },
            ],
            req,
          })
        }
        data.address = address
        return data
      },
    ],
    beforeChange: [forcePublicStatus('en_attente'), assignReference, rejectTakenSlot],
    afterChange: [sendBookingEmail],
  },
}
