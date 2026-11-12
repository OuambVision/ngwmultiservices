import { APIError, type Endpoint } from 'payload'

import { listBookableSlots } from '../availability/slots'

export const availabilitySlots: Endpoint = {
  path: '/slots',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url ?? 'http://localhost')
    try {
      const result = await listBookableSlots(req.payload, {
        date: url.searchParams.get('date') ?? '',
        service: url.searchParams.get('service') ?? '',
      })
      return Response.json(result)
    } catch (error) {
      const status = error instanceof APIError ? error.status : 500
      const message = error instanceof APIError ? error.message : 'Créneaux indisponibles.'
      return Response.json({ message }, { status })
    }
  },
}
