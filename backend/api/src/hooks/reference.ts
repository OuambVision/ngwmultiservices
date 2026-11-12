import { randomInt } from 'node:crypto'

import { APIError, type PayloadRequest } from 'payload'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function makeReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  let suffix = ''
  for (let index = 0; index < 4; index += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)]
  }
  return `NGW-${date}-${suffix}`
}

type ReferenceArgs = {
  data?: { reference?: unknown }
  operation: 'create' | 'update'
  req: PayloadRequest
}

export async function assignReference({ data, operation, req }: ReferenceArgs) {
  if (operation !== 'create' || !data) return data
  if (req.user && typeof data.reference === 'string' && data.reference.trim()) {
    data.reference = data.reference.trim()
    return data
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = makeReference()
    const existing = await req.payload.find({
      collection: 'bookings',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { reference: { equals: reference } },
    })
    if (existing.totalDocs === 0) {
      data.reference = reference
      return data
    }
  }

  throw new APIError('Impossible de produire une référence.', 500)
}
