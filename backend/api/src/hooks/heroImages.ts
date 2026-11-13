import type { GlobalBeforeChangeHook, PayloadRequest } from 'payload'

import { relationId } from '../lib/relation'

const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

function absoluteUrl(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return new URL(value, serverURL).toString()
}

async function mediaUrl(req: PayloadRequest, image: unknown): Promise<string | null> {
  const id = relationId(image)
  if (id == null) return null

  const media = await req.payload.findByID({
    collection: 'media',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return typeof media.url === 'string' && media.url.length > 0 ? absoluteUrl(media.url) : null
}

export const fillHeroImageUrls: GlobalBeforeChangeHook = async ({ data, req }) => {
  if (!Array.isArray(data?.heroImages)) return data

  for (const row of data.heroImages) {
    if (!row || typeof row !== 'object') continue
    const record = row as { image?: unknown; url?: string | null }
    record.url = await mediaUrl(req, record.image)
  }

  return data
}
