import { ValidationError, type CollectionConfig } from 'payload'

import { staff } from '../access'
import { availabilitySlots } from '../endpoints/availabilitySlots'
import { TIME, weekdayOptions } from '../lib/calendar'

export const Availability: CollectionConfig = {
  slug: 'availability',
  labels: { singular: 'Disponibilité', plural: 'Disponibilités' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'type', 'day', 'date'],
    group: 'Demandes',
    description:
      'Un jour ouvert propose des heures. Une fermeture retire toutes les heures de cette date.',
  },
  access: {
    create: staff,
    read: staff,
    update: staff,
    delete: staff,
  },
  endpoints: [availabilitySlots],
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Jour ouvert', value: 'jour' },
        { label: 'Date fermée', value: 'fermeture' },
      ],
    },
    {
      name: 'label',
      label: 'Libellé',
      type: 'text',
      admin: { readOnly: true, description: 'Rempli à partir du jour ou de la date.' },
    },
    {
      name: 'day',
      label: 'Jour',
      type: 'select',
      options: weekdayOptions,
      admin: { condition: (data) => data.type === 'jour' },
    },
    {
      name: 'times',
      label: 'Heures proposées',
      type: 'array',
      admin: { condition: (data) => data.type === 'jour' },
      fields: [
        {
          name: 'time',
          label: 'Heure',
          type: 'text',
          required: true,
          validate: (value: unknown) =>
            (typeof value === 'string' && TIME.test(value)) || 'Heure au format HH:mm.',
        },
      ],
    },
    {
      name: 'date',
      label: 'Date fermée',
      type: 'date',
      admin: {
        condition: (data) => data.type === 'fermeture',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        if (data.type === 'jour') {
          const times = Array.isArray(data.times) ? data.times : []
          if (!data.day || times.length === 0) {
            throw new ValidationError({
              collection: 'availability',
              errors: [
                {
                  message: 'Un jour ouvert a besoin d’un jour et d’au moins une heure.',
                  path: 'day',
                },
              ],
              req,
            })
          }
          data.label = String(data.day)
        }
        if (data.type === 'fermeture') {
          if (!data.date) {
            throw new ValidationError({
              collection: 'availability',
              errors: [{ message: 'La date fermée est requise.', path: 'date' }],
              req,
            })
          }
          data.label = String(data.date).slice(0, 10)
        }
        return data
      },
    ],
  },
}
