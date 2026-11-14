import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import { renderBookingEmail } from '../lib/email/bookingTemplate'
import { ngwInbox, sendMail } from '../lib/email/sendMail'

function formatDay(value: unknown) {
  const date = new Date(String(value ?? ''))
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-CA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

async function serviceTitle(service: unknown, req: PayloadRequest) {
  if (
    service &&
    typeof service === 'object' &&
    'title' in service &&
    typeof service.title === 'string'
  ) {
    return service.title
  }
  const id =
    typeof service === 'number'
      ? service
      : service && typeof service === 'object' && 'id' in service
        ? service.id
        : null
  if (typeof id !== 'number') return 'Service'
  const doc = await req.payload.findByID({
    collection: 'services',
    id,
    depth: 0,
    locale: 'fr',
    overrideAccess: true,
  })
  return typeof doc?.title === 'string' ? doc.title : 'Service'
}

function locationLabel(doc: { location?: string | null; address?: string | null }) {
  if (doc.location === 'ngw') return 'Chez NGW'
  const address = typeof doc.address === 'string' ? doc.address.trim() : ''
  return address ? `Chez le client — ${address}` : 'Chez le client'
}

export const sendBookingEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  try {
    const service = await serviceTitle(doc.service, req)
    const when = `${formatDay(doc.date)} à ${doc.time ?? ''}`.trim()
    const place = locationLabel(doc)
    const reference = String(doc.reference ?? '')
    const rows: Array<[string, string]> = [
      ['Référence', reference],
      ['Service', service],
      ['Date', when],
      ['Lieu', place],
      ['Statut', 'En cours de traitement'],
    ]

    await sendMail({
      to: String(doc.email),
      replyTo: ngwInbox,
      subject: `NGW MULTISERVICES — demande ${reference}`,
      html: renderBookingEmail(
        'Demande bien reçue',
        'Nous avons bien reçu votre demande. Elle est en cours de traitement. Notre équipe vous contactera pour confirmer le rendez-vous.',
        rows,
      ),
    })

    await sendMail({
      to: ngwInbox,
      replyTo: String(doc.email),
      subject: `Nouvelle réservation ${reference}`,
      html: renderBookingEmail(
        'Nouvelle demande de réservation',
        'Une demande vient d’être enregistrée sur le site.',
        [
          ...rows,
          ['Nom', String(doc.name ?? '')],
          ['Courriel', String(doc.email ?? '')],
          ['Téléphone', String(doc.phone ?? '')],
          ['Note', typeof doc.note === 'string' ? doc.note : ''],
        ],
      ),
    })

    console.log('[courriel] Accusé envoyé', { to: doc.email, reference })
    console.log('[courriel] Alerte envoyée', { to: ngwInbox, reference })
  } catch (error) {
    console.error('[courriel] Échec de l’envoi', error instanceof Error ? error.message : error)
  }

  return doc
}
