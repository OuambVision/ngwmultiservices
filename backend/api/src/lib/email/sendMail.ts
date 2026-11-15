import { Resend } from 'resend'

export const ngwInbox = process.env.NGW_INBOX?.trim() || 'ngwmultiservice@gmail.com'

type Mail = {
  to: string
  subject: string
  html: string
  replyTo?: string
  /** Override the default RESEND_FROM_EMAIL sender. */
  from?: string
}

export async function sendMail({ to, subject, html, replyTo, from: fromOverride }: Mail) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const address = fromOverride || process.env.RESEND_FROM_EMAIL || 'noreply@kwat.live'
  const from = address.includes('<') ? address : `Ngw Multiservices <${address}>`
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from, to, subject, html, replyTo })
  if (error) throw new Error(error.message)
}

/** Fallback when the production From domain is not verified yet. */
export const resendTestFrom = 'Ngw Multiservices <beth.t@example.com>'
