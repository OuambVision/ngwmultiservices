import type { Endpoint } from 'payload'

import { resolveBookingWindow } from '../availability/slots'

export const availabilityWindow: Endpoint = {
  path: '/window',
  method: 'get',
  handler: async (req) => {
    const window = await resolveBookingWindow(req.payload)
    return Response.json(window)
  },
}
