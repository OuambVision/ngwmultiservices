import { APIError, type Endpoint } from 'payload'

import { listOpenDates } from '../availability/slots'

export const availabilityDays: Endpoint = {
  path: '/days',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url ?? 'http://localhost')
    try {
      const result = await listOpenDates(req.payload, {
        from: url.searchParams.get('from') ?? '',
        service: url.searchParams.get('service') ?? '',
        to: url.searchParams.get('to') ?? '',
      })
      return Response.json(result)
    } catch (error) {
      const status = error instanceof APIError ? error.status : 500
      const message = error instanceof APIError ? error.message : 'Disponibilités indisponibles.'
      return Response.json({ message }, { status })
    }
  },
}
