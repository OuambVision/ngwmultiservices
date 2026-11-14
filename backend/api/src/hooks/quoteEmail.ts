import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import { renderBookingEmail } from '../lib/email/bookingTemplate'
import { ngwInbox, sendMail } from '../lib/email/sendMail'

async function categoryTitle(category: unknown, req: PayloadRequest) {
  if (category && typeof category === 'object' && 'title' in category && typeof category.title === 'string') {
    return category.title
  }
  const id =
    typeof category === 'number'
      ? category
      : category && typeof category === 'object' && 'id' in category
        ? category.id
        : null
  if (typeof id !== 'number') return ''
  const doc = await req.payload.findByID({
    collection: 'categories',
    id,
    depth: 0,
    locale: 'fr',
    overrideAccess: true,
  })
  return typeof doc?.title === 'string' ? doc.title : ''
}

export const sendQuoteEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  try {
    const category = doc.other ? 'Autre' : await categoryTitle(doc.category, req)
    const rows: Array<[string, string]> = [
      ['Catégorie', category],
      ['Besoin', String(doc.need ?? '')],
      ['Statut', 'Reçue'],
    ]

    const client = String(doc.email)
    const clientMail = sendMail({
      to: client,
      replyTo: ngwInbox,
      subject: 'NGW MULTISERVICES — votre demande de devis',
      html: renderBookingEmail(
        'Demande de devis reçue',
        'Nous avons bien reçu votre besoin. Notre équipe vous répondra par courriel avec une estimation. Ce n’est pas encore un rendez-vous.',
        rows,
      ),
    })
    const ownerMail = sendMail({
      to: ngwInbox,
      replyTo: client,
      subject: 'Nouvelle demande de devis',
      html: renderBookingEmail('Nouvelle demande de devis', 'Une demande de devis vient d’être enregistrée sur le site.', [
        ...rows,
        ['Nom', String(doc.name ?? '')],
        ['Courriel', client],
        ['Téléphone', String(doc.phone ?? '')],
      ]),
    })
    const [clientResult, ownerResult] = await Promise.allSettled([clientMail, ownerMail])
    if (clientResult.status === 'fulfilled') console.log('[courriel] Devis envoyé au client', { to: client })
    else console.error('[courriel] Échec du devis client', clientResult.reason instanceof Error ? clientResult.reason.message : clientResult.reason)
    if (ownerResult.status === 'fulfilled') console.log('[courriel] Devis envoyé au propriétaire', { to: ngwInbox })
    else console.error('[courriel] Échec du devis propriétaire', ownerResult.reason instanceof Error ? ownerResult.reason.message : ownerResult.reason)
  } catch (error) {
    console.error('[courriel] Échec du devis', error instanceof Error ? error.message : error)
  }

  return doc
}
