import { ValidationError, type CollectionConfig } from 'payload'

import { staff } from '../access'
import { availabilityDays } from '../endpoints/availabilityDays'
import { availabilitySlots } from '../endpoints/availabilitySlots'
import { availabilityWindow } from '../endpoints/availabilityWindow'
import { TIME, weekdayOptions } from '../lib/calendar'

function isTime(value: unknown): value is string {
  return typeof value === 'string' && TIME.test(value)
}

export const Availability: CollectionConfig = {
  slug: 'availability',
  labels: { singular: 'Disponibilité', plural: 'Disponibilités' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'type', 'day', 'startTime', 'endTime', 'validFrom', 'validTo', 'date'],
    listSearchableFields: ['label'],
    group: 'Planning',
    description:
      'Préférez le Planning Outlook (menu) pour définir les horaires. Ici : réglages avancés (plages, périodes, exceptions).',
    components: {
      beforeListTable: ['/components/admin/availability/PlanningLink#PlanningLink'],
    },
  },
  access: {
    create: staff,
    read: staff,
    update: staff,
    delete: staff,
  },
  endpoints: [availabilitySlots, availabilityDays, availabilityWindow],
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Horaire récurrent (semaine)', value: 'jour' },
        { label: 'Fermeture / indisponibilité', value: 'fermeture' },
        { label: 'Exception (horaires d’un jour)', value: 'exception' },
      ],
      admin: {
        description:
          'Horaire = plage récurrente sur une période. Fermeture = jour ou période indisponible. Exception = horaires spéciaux pour une date.',
      },
    },
    {
      name: 'label',
      label: 'Libellé',
      type: 'text',
      admin: { readOnly: true, description: 'Rempli automatiquement.' },
    },
    {
      name: 'day',
      label: 'Jour de la semaine',
      type: 'select',
      options: weekdayOptions,
      admin: { condition: (data) => data.type === 'jour' },
    },
    {
      type: 'row',
      admin: { condition: (data) => data.type === 'jour' || data.type === 'exception' },
      fields: [
        {
          name: 'startTime',
          label: 'Début',
          type: 'text',
          admin: { placeholder: '08:00', width: '33%' },
          validate: (value: unknown) =>
            value == null || value === '' || isTime(value) || 'Heure au format HH:mm.',
        },
        {
          name: 'endTime',
          label: 'Fin',
          type: 'text',
          admin: { placeholder: '17:00', width: '33%' },
          validate: (value: unknown) =>
            value == null || value === '' || isTime(value) || 'Heure au format HH:mm.',
        },
        {
          name: 'slotMinutes',
          label: 'Créneau (min)',
          type: 'number',
          defaultValue: 60,
          min: 15,
          max: 240,
          admin: { width: '33%', description: 'Durée entre deux départs (ex. 60).' },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (data) => data.type === 'jour' },
      fields: [
        {
          name: 'validFrom',
          label: 'Valide du',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
            description: 'Début d’application de cet horaire.',
          },
        },
        {
          name: 'validTo',
          label: 'Valide jusqu’au',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
            description: 'Ex. 2027-03-31 pour ouvrir jusqu’à fin mars 2027.',
          },
        },
      ],
    },
    {
      name: 'times',
      label: 'Heures (legacy)',
      type: 'array',
      admin: {
        condition: (data) => data.type === 'jour' || data.type === 'exception',
        description: 'Optionnel si Début/Fin sont renseignés. Conservé pour compatibilité.',
      },
      fields: [
        {
          name: 'time',
          label: 'Heure',
          type: 'text',
          required: true,
          validate: (value: unknown) => isTime(value) || 'Heure au format HH:mm.',
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (data) => data.type === 'fermeture' || data.type === 'exception' },
      fields: [
        {
          name: 'date',
          label: 'Date de début',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
          },
        },
        {
          name: 'dateEnd',
          label: 'Date de fin (optionnel)',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
            description: 'Laisser vide pour une seule journée. Utile pour fermer tout un mois.',
            condition: (data) => data.type === 'fermeture',
          },
        },
      ],
    },
    {
      type: 'row',
      admin: {
        condition: (data) => data.type === 'fermeture',
      },
      fields: [
        {
          name: 'blockStart',
          label: 'Bloquer de',
          type: 'text',
          admin: {
            placeholder: '12:00',
            width: '50%',
            description:
              'Optionnel : bloquer seulement une sous-plage (ex. 12:00–14:00). Sinon journée entière.',
          },
          validate: (value: unknown) =>
            value == null || value === '' || isTime(value) || 'Heure au format HH:mm.',
        },
        {
          name: 'blockEnd',
          label: 'Bloquer jusqu’à',
          type: 'text',
          admin: { placeholder: '14:00', width: '50%' },
          validate: (value: unknown) =>
            value == null || value === '' || isTime(value) || 'Heure au format HH:mm.',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        data.startTime = normalizeTime(data.startTime)
        data.endTime = normalizeTime(data.endTime)
        data.blockStart = normalizeTime(data.blockStart)
        data.blockEnd = normalizeTime(data.blockEnd)

        if (data.type === 'jour') {
          const hasRange = isTime(data.startTime) && isTime(data.endTime)
          const times = Array.isArray(data.times) ? data.times : []
          if (!data.day || (!hasRange && times.length === 0)) {
            throw new ValidationError({
              collection: 'availability',
              errors: [
                {
                  message: 'Un horaire exige un jour et une plage (début/fin) ou des heures.',
                  path: 'day',
                },
              ],
              req,
            })
          }
          if (hasRange && timeOrderInvalid(data.startTime, data.endTime)) {
            throw new ValidationError({
              collection: 'availability',
              errors: [{ message: 'La fin doit être après le début.', path: 'endTime' }],
              req,
            })
          }
          const from = sliceDay(data.validFrom)
          const to = sliceDay(data.validTo)
          const range =
            from && to ? ` (${from} → ${to})` : from ? ` (dès ${from})` : to ? ` (jusqu’au ${to})` : ''
          data.label = `${data.day}${hasRange ? ` ${data.startTime}-${data.endTime}` : ''}${range}`
        }

        if (data.type === 'fermeture') {
          if (!data.date) {
            throw new ValidationError({
              collection: 'availability',
              errors: [{ message: 'La date de début est requise.', path: 'date' }],
              req,
            })
          }
          const start = sliceDay(data.date)
          const end = sliceDay(data.dateEnd) || start
          const band =
            isTime(data.blockStart) && isTime(data.blockEnd)
              ? ` ${data.blockStart}-${data.blockEnd}`
              : ''
          data.label = end && end !== start ? `Fermé ${start} → ${end}${band}` : `Fermé ${start}${band}`
        }

        if (data.type === 'exception') {
          if (!data.date) {
            throw new ValidationError({
              collection: 'availability',
              errors: [{ message: 'La date est requise.', path: 'date' }],
              req,
            })
          }
          const hasRange = isTime(data.startTime) && isTime(data.endTime)
          const times = Array.isArray(data.times) ? data.times : []
          if (!hasRange && times.length === 0) {
            throw new ValidationError({
              collection: 'availability',
              errors: [
                {
                  message: 'Une exception exige une plage début/fin ou des heures.',
                  path: 'startTime',
                },
              ],
              req,
            })
          }
          const day = sliceDay(data.date)
          data.label = hasRange
            ? `Exception ${day} ${data.startTime}-${data.endTime}`
            : `Exception ${day}`
        }

        return data
      },
    ],
  },
}

function sliceDay(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  return value.slice(0, 10)
}

function normalizeTime(value: unknown): unknown {
  if (value == null || value === '') return value
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (!match) return trimmed
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

function timeOrderInvalid(start: unknown, end: unknown): boolean {
  if (!isTime(start) || !isTime(end)) return true
  return start >= end
}
