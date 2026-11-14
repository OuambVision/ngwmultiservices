'use server'

import { API_URL } from '@repo/api'

type ContactInput = {
  email: string
  message: string
  name: string
  phone: string
}

type PayloadError = {
  errors?: Array<{ message?: string }>
  message?: string
}

export async function sendContactMessage(
  input: ContactInput,
): Promise<{ message: string; ok: false } | { ok: true }> {
  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        message: input.message.trim(),
        name: input.name.trim(),
        phone: input.phone.trim(),
      }),
      cache: 'no-store',
    })
    if (response.ok) return { ok: true }
    const body = (await response.json().catch(() => null)) as PayloadError | null
    return {
      ok: false,
      message: body?.errors?.[0]?.message || body?.message || 'save',
    }
  } catch {
    return { ok: false, message: 'save' }
  }
}
