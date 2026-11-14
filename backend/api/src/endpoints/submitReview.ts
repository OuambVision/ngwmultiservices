import type { Endpoint } from 'payload'

const maxBytes = 10 * 1024 * 1024
const maxFiles = 5
const maxText = 500

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])

function fail(code: string, status = 400) {
  return Response.json({ errors: [{ message: code }] }, { status })
}

export const submitReview: Endpoint = {
  path: '/submit',
  method: 'post',
  handler: async (req) => {
    let form: FormData
    try {
      const parsed = await req.formData?.()
      if (!parsed) return fail('missing')
      form = parsed
    } catch {
      return fail('missing')
    }

    const author = String(form.get('author') ?? '').trim()
    const text = String(form.get('text') ?? '').trim()
    const rating = Number(form.get('rating'))
    const serviceId = Number(form.get('service'))
    const consent = form.get('consent') === 'true'
    const files = form.getAll('media').filter((item): item is File => item instanceof File && item.size > 0)

    if (!author || !text || !consent || !Number.isInteger(rating) || rating < 1 || rating > 5 || !Number.isInteger(serviceId)) {
      return fail('missing')
    }
    if (text.length > maxText) return fail('too-long')
    if (files.length > maxFiles) return fail('too-many')

    for (const file of files) {
      if (file.size > maxBytes) return fail('file-too-big')
      if (!allowedTypes.has(file.type)) return fail('file-type')
    }

    const service = await req.payload
      .findByID({ collection: 'services', id: serviceId, depth: 0, overrideAccess: true })
      .catch(() => null)
    if (!service || service.published === false) return fail('service')

    const media: number[] = []
    for (const file of files) {
      const data = Buffer.from(await file.arrayBuffer())
      const created = await req.payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt: author },
        file: { data, mimetype: file.type, name: file.name, size: data.length },
      })
      media.push(created.id)
    }

    const review = await req.payload.create({
      collection: 'reviews',
      locale: 'fr',
      overrideAccess: true,
      data: {
        author,
        consent: true,
        media,
        rating,
        service: serviceId,
        status: 'en_attente',
        text,
      },
    })
    await req.payload.update({
      collection: 'reviews',
      id: review.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { text },
    })

    return Response.json({ doc: { id: review.id, status: review.status } })
  },
}
