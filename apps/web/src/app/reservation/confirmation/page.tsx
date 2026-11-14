import type { Metadata } from 'next'

import { ReservationConfirmation } from '@/components/site/reservation-confirmation'
import { getT } from '@/i18n/server'

type PageProps = {
  searchParams: Promise<{ reference?: string | string[] }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('reservation.confirmTitle') }
}

export default async function ReservationConfirmationPage({ searchParams }: PageProps) {
  const query = (await searchParams).reference
  const reference = Array.isArray(query) ? query[0] ?? '' : query ?? ''
  return <ReservationConfirmation reference={reference} />
}
