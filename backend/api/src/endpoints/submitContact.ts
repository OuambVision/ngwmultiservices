import type { Endpoint } from 'payload'

import { renderBookingEmail } from '../lib/email/bookingTemplate'
import { ngwInbox, resendTestFrom, sendMail } from '../lib/email/sendMail'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/
const namePattern = /^[\p{L}][\p{L}\s'.-]{0,78}$/u

function fail(code: string, status = 400) {
  return Response.json({ errors: [{ message: code }] }, { status })
}

async function deliver(mail: Parameters<typeof sendMail>[0]) {
  try {
    await sendMail(mail)
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!/not verified|testing emails/i.test(message)) throw error
    await sendMail({ ...mail, from: resendTestFrom })
  }
}

export const submitContact: Endpoint = {
  path: '/contact',
  method: 'post',
  handler: async (req) => {
    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return fail('missing')
    }

    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const message = String(body.message ?? '').trim()

    if (!name || !email || !message) return fail('missing')
    if (!namePattern.test(name)) return fail('name')
    if (!emailPattern.test(email)) return fail('email')
    if (phone && !phonePattern.test(phone)) return fail('phone')
    if (message.length < 10) return fail('message')
    if (message.length > 1000) return fail('too-long')

    const rows: Array<[string, string]> = [
      ['Message', message],
      ['Statut', 'Reçu'],
    ]

    try {
      const ownerMail = deliver({
        to: ngwInbox,
        replyTo: email,
        subject: 'Nouveau message de contact',
        html: renderBookingEmail('Nouveau message de contact', 'Un visiteur a envoyé un message depuis la page Contact.', [
          ...rows,
          ['Nom', name],
          ['Courriel', email],
          ['Téléphone', phone],
        ]),
      })
      const clientMail = deliver({
        to: email,
        replyTo: ngwInbox,
        subject: 'NGW MULTISERVICES — nous avons bien reçu votre message',
        html: renderBookingEmail(
          'Message reçu',
          'Merci de nous avoir écrit. Notre équipe vous répondra sous peu par courriel ou par téléphone.',
          rows,
        ),
      })
      const [ownerResult, clientResult] = await Promise.allSettled([ownerMail, clientMail])
      if (ownerResult.status === 'rejected') {
        const reason = ownerResult.reason instanceof Error ? ownerResult.reason.message : String(ownerResult.reason)
        console.error('[courriel] Échec du contact propriétaire', reason)
        return fail('save', 500)
      }
      console.log('[courriel] Contact envoyé au propriétaire', { to: ngwInbox })
      if (clientResult.status === 'fulfilled') {
        console.log('[courriel] Accusé contact envoyé', { to: email })
      } else {
        console.error(
          '[courriel] Échec de l’accusé contact',
          clientResult.reason instanceof Error ? clientResult.reason.message : clientResult.reason,
        )
      }
      return Response.json({ ok: true })
    } catch (error) {
      console.error('[courriel] Échec du contact', error instanceof Error ? error.message : error)
      return fail('save', 500)
    }
  },
}
