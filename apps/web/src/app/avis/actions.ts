'use server'

import { API_URL } from '@repo/api'

type PayloadError = {
  doc?: { id?: number }
  errors?: Array<{ message?: string }>
}

export async function createReview(formData: FormData): Promise<{ message: string; ok: false } | { ok: true }> {
  try {
    const response = await fetch(`${API_URL}/reviews/submit`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    })
    const body = (await response.json().catch(() => null)) as PayloadError | null
    if (!response.ok || typeof body?.doc?.id !== 'number') {
      return { ok: false, message: body?.errors?.[0]?.message || 'save' }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: 'save' }
  }
}
