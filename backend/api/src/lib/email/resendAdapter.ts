import type { EmailAdapter, SendEmailOptions } from 'payload'

import { resendTestFrom, sendMail } from './sendMail'

function parseAddress(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim()
  return undefined
}

function parseFrom(value: unknown): { address: string; name: string } | null {
  const raw = parseAddress(value)
  if (!raw) return null
  const match = /^"?([^"<]+)"?\s*<([^>]+)>$/.exec(raw)
  if (match) return { name: match[1].trim(), address: match[2].trim() }
  return { name: 'NGW MULTISERVICES', address: raw }
}

/**
 * Payload email adapter backed by our Resend helper (same From / fallback as the rest of the app).
 */
export const resendEmailAdapter = (): EmailAdapter => {
  const configured = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@kwat.live'
  const parsed = parseFrom(
    configured.includes('<') ? configured : `NGW MULTISERVICES <${configured}>`,
  ) || { name: 'NGW MULTISERVICES', address: configured }

  return () => ({
    name: 'resend',
    defaultFromName: parsed.name,
    defaultFromAddress: parsed.address,
    sendEmail: async (message: SendEmailOptions) => {
      const to = parseAddress(message.to)
      if (!to) throw new Error('Destinataire manquant pour l’envoi du courriel.')

      const html =
        typeof message.html === 'string'
          ? message.html
          : typeof message.text === 'string'
            ? `<pre style="font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;">${message.text}</pre>`
            : ''
      if (!html) throw new Error('Contenu HTML manquant pour l’envoi du courriel.')

      const subject = typeof message.subject === 'string' ? message.subject : 'NGW MULTISERVICES'
      const replyTo = parseAddress(message.replyTo)
      const fromOverride = parseAddress(message.from)

      try {
        await sendMail({ to, subject, html, replyTo, from: fromOverride })
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        if (!/not verified|testing emails/i.test(text)) throw error
        await sendMail({ to, subject, html, replyTo, from: resendTestFrom })
      }

      return { message: 'ok' }
    },
  })
}
