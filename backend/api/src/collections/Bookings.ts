import type { CollectionConfig } from 'payload'

import { anyone, staff, staffField } from '../access'
import { bookingStatuses } from '../domain/statuses'
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
    defaultColumns: ['reference', 'status', 'date', 'time', 'name', 'service'],
    group: 'Demandes',
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
    { name: 'phone', label: 'Téléphone', type: 'text', required: true },
    { name: 'address', label: 'Adresse du service', type: 'textarea', required: true },
    { name: 'note', label: 'Note', type: 'textarea' },
    lockedStatusField(bookingStatuses, 'en_attente'),
  ],
  hooks: {
    beforeChange: [forcePublicStatus('en_attente'), assignReference, rejectTakenSlot],
  },
}
