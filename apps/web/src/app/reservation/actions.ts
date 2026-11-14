'use server'

import { API_URL } from '@repo/api'

type BookingInput = {
  address: string
  date: string
  email: string
  location: 'client' | 'ngw'
  name: string
  note: string
  phone: string
  service: number
  time: string
}

type PayloadError = {
  errors?: Array<{ message?: string }>
  message?: string
  reference?: string
  doc?: { reference?: string }
}

export async function createBooking(
  input: BookingInput,
): Promise<{ message: string; ok: false } | { ok: true; reference: string }> {
  try {
    const response = await fetch(`${API_URL}/bookings?locale=fr&fallback-locale=fr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: input.location === 'client' ? input.address.trim() : '',
        date: `${input.date}T12:00:00.000Z`,
        email: input.email.trim(),
        location: input.location,
        name: input.name.trim(),
        note: input.note.trim() || undefined,
        phone: input.phone.trim(),
        service: input.service,
        time: input.time,
      }),
      cache: 'no-store',
    })
    const body = (await response.json().catch(() => null)) as PayloadError | null
    if (!response.ok) {
      return {
        ok: false,
        message: body?.errors?.[0]?.message || body?.message || 'La demande n’a pas pu être enregistrée.',
      }
    }
    const reference = body?.doc?.reference ?? body?.reference
    if (!reference) return { ok: false, message: 'La demande n’a pas pu être enregistrée.' }
    return { ok: true, reference }
  } catch {
    return { ok: false, message: 'La demande n’a pas pu être enregistrée.' }
  }
}
