'use server'

import { API_URL } from '@repo/api'

type QuoteInput = {
  category?: number
  email: string
  name: string
  need: string
  other: boolean
  phone: string
}

type PayloadError = {
  errors?: Array<{ message?: string }>
  id?: number
  message?: string
  doc?: { id?: number }
}

export async function createQuote(input: QuoteInput): Promise<{ message: string; ok: false } | { ok: true }> {
  try {
    const response = await fetch(`${API_URL}/quoteRequests?locale=fr&fallback-locale=fr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: input.other ? undefined : input.category,
        other: input.other,
        email: input.email.trim(),
        name: input.name.trim(),
        need: input.need.trim(),
        phone: input.phone.trim(),
      }),
      cache: 'no-store',
    })
    const body = (await response.json().catch(() => null)) as PayloadError | null
    const id = body?.doc?.id ?? body?.id
    if (!response.ok || typeof id !== 'number') {
      return {
        ok: false,
        message: body?.errors?.[0]?.message || body?.message || 'La demande n’a pas pu être enregistrée.',
      }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: 'La demande n’a pas pu être enregistrée.' }
  }
}
