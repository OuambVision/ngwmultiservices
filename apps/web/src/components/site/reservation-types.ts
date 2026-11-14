export const bookingWindow = { start: '2026-11-01', end: '2026-12-31' } as const

export type ReservationService = {
  categorySlug: string
  categoryTitle: string
  duration: string
  id: number
  image: string
  imageAlt: string
  included: string[]
  place: string
  price: string
  ratingAverage: number
  ratingCount: number
  slug: string
  summary: string
  title: string
}

export type ReservationCategory = {
  services: ReservationService[]
  slug: string
  title: string
}

export type ReservationReceipt = {
  categoryTitle: string
  dateLabel: string
  duration: string
  image: string
  imageAlt: string
  place: string
  price: string
  reference: string
  serviceTitle: string
  summary: string
  time: string
}

export const reservationReceiptKey = 'ngw-reservation-receipt'
