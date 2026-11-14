import type { Payload, PayloadRequest, Where } from 'payload'

import { bookingStatuses } from '../../../domain/statuses'

const TZ = 'America/Toronto'

export type DashboardMetric = {
  key: string
  label: string
  value: number
  hint: string | null
  tone: 'blue' | 'orange' | 'green' | 'slate'
}

export type DashboardBookingRow = {
  id: string | number
  name: string
  service: string
  category: string
  when: string
  status: string
  statusLabel: string
}

export type DashboardDayBar = {
  key: string
  label: string
  count: number
}

export type DashboardActivity = {
  id: string
  title: string
  detail: string
  when: string
  href: string
}

export type DashboardReview = {
  id: string | number
  author: string
  rating: number
  text: string
  photo: string | null
  href: string
}

export type DashboardData = {
  weekLabel: string
  metrics: DashboardMetric[]
  recentBookings: DashboardBookingRow[]
  weekBars: DashboardDayBar[]
  activity: DashboardActivity[]
  pendingReviews: DashboardReview[]
  pendingReviewCount: number
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Semaine civile lundi → dimanche (référence Toronto). */
export function weekRange(reference = new Date()) {
  const local = new Date(reference.toLocaleString('en-US', { timeZone: TZ }))
  const day = local.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = startOfDay(new Date(local))
  start.setDate(start.getDate() + mondayOffset)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - 7)
  const previousEnd = new Date(start)
  return { start, end, previousStart, previousEnd }
}

function isoDay(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatWeekLabel(start: Date, endExclusive: Date) {
  const end = new Date(endExclusive)
  end.setDate(end.getDate() - 1)
  const fmt = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

function formatWhen(date: string | null | undefined, time?: string | null) {
  if (!date) return '—'
  const day = String(date).slice(0, 10)
  const fmt = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
  const label = fmt.format(new Date(`${day}T12:00:00`))
  return time ? `${label} · ${time}` : label
}

function relativeWhen(iso: string | null | undefined) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'À l’instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `Il y a ${hours} h`
  const days = Math.round(hours / 24)
  return `Il y a ${days} j`
}

function statusLabel(value: string, list: ReadonlyArray<{ label: string; value: string }>) {
  return list.find((item) => item.value === value)?.label ?? value
}

function deltaHint(current: number, previous: number, unit: 'pct' | 'abs' = 'pct') {
  if (unit === 'abs') {
    const diff = current - previous
    if (diff === 0) return null
    return diff > 0 ? `+${diff} nouvelles` : `${diff}`
  }
  if (previous <= 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return null
  return `${pct > 0 ? '+' : ''}${pct} % vs semaine dernière`
}

async function countBookings(payload: Payload, req: PayloadRequest, where: Where) {
  const result = await payload.find({
    collection: 'bookings',
    depth: 0,
    limit: 0,
    overrideAccess: false,
    req,
    where,
  })
  return result.totalDocs
}

export async function loadDashboardData(payload: Payload, req: PayloadRequest): Promise<DashboardData> {
  const { start, end, previousStart, previousEnd } = weekRange()
  const startIso = isoDay(start)
  const endIso = isoDay(end)
  const prevStartIso = isoDay(previousStart)
  const prevEndIso = isoDay(previousEnd)

  const inWeek: Where = {
    and: [{ date: { greater_than_equal: startIso } }, { date: { less_than: endIso } }],
  }
  const inPrevWeek: Where = {
    and: [{ date: { greater_than_equal: prevStartIso } }, { date: { less_than: prevEndIso } }],
  }

  const dayQueries = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    const key = isoDay(day)
    const next = new Date(day)
    next.setDate(day.getDate() + 1)
    return { day, key, nextIso: isoDay(next) }
  })

  const [
    weekTotal,
    prevWeekTotal,
    pending,
    pendingNewThisWeek,
    confirmedWeek,
    prevConfirmedWeek,
    doneWeek,
    recent,
    pendingReviewsResult,
    recentQuotes,
    recentReviewsAll,
    ...dayCounts
  ] = await Promise.all([
    countBookings(payload, req, inWeek),
    countBookings(payload, req, inPrevWeek),
    countBookings(payload, req, { status: { equals: 'en_attente' } }),
    countBookings(payload, req, {
      and: [
        { status: { equals: 'en_attente' } },
        { createdAt: { greater_than_equal: start.toISOString() } },
        { createdAt: { less_than: end.toISOString() } },
      ],
    }),
    countBookings(payload, req, {
      and: [{ date: { greater_than_equal: startIso } }, { date: { less_than: endIso } }, { status: { equals: 'confirmee' } }],
    }),
    countBookings(payload, req, {
      and: [
        { date: { greater_than_equal: prevStartIso } },
        { date: { less_than: prevEndIso } },
        { status: { equals: 'confirmee' } },
      ],
    }),
    countBookings(payload, req, {
      and: [{ date: { greater_than_equal: startIso } }, { date: { less_than: endIso } }, { status: { equals: 'terminee' } }],
    }),
    payload.find({
      collection: 'bookings',
      depth: 2,
      limit: 6,
      overrideAccess: false,
      req,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'reviews',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      req,
      sort: '-createdAt',
      where: { status: { equals: 'en_attente' } },
    }),
    payload.find({
      collection: 'quoteRequests',
      depth: 0,
      limit: 5,
      overrideAccess: false,
      req,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'reviews',
      depth: 0,
      limit: 5,
      overrideAccess: false,
      req,
      sort: '-createdAt',
    }),
    ...dayQueries.map(({ key, nextIso }) =>
      countBookings(payload, req, {
        and: [{ date: { greater_than_equal: key } }, { date: { less_than: nextIso } }],
      }),
    ),
  ])

  const weekBars: DashboardDayBar[] = dayQueries.map(({ day, key }, index) => ({
    key,
    label: new Intl.DateTimeFormat('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' }).format(day),
    count: Number(dayCounts[index] ?? 0),
  }))

  const recentBookings: DashboardBookingRow[] = recent.docs.map((doc) => {
    const service =
      doc.service && typeof doc.service === 'object'
        ? String((doc.service as { title?: string }).title ?? 'Service')
        : 'Service'
    const category =
      doc.service &&
      typeof doc.service === 'object' &&
      (doc.service as { category?: unknown }).category &&
      typeof (doc.service as { category?: unknown }).category === 'object'
        ? String(((doc.service as { category: { title?: string } }).category).title ?? '')
        : ''
    const status = String(doc.status ?? '')
    return {
      id: doc.id,
      name: String(doc.name ?? ''),
      service,
      category,
      when: formatWhen(String(doc.date ?? ''), String(doc.time ?? '')),
      status,
      statusLabel: statusLabel(status, bookingStatuses),
    }
  })

  const activityPool: Array<DashboardActivity & { ts: number }> = [
    ...recent.docs.map((doc) => ({
      id: `b-${doc.id}`,
      title: 'Nouvelle réservation',
      detail: `${doc.name ?? ''} · ${String(doc.reference ?? '')}`,
      when: relativeWhen(String(doc.createdAt ?? '')),
      href: `/admin/collections/bookings/${doc.id}`,
      ts: new Date(String(doc.createdAt ?? 0)).getTime(),
    })),
    ...recentQuotes.docs.map((doc) => ({
      id: `q-${doc.id}`,
      title: 'Demande de devis',
      detail: String(doc.name ?? ''),
      when: relativeWhen(String(doc.createdAt ?? '')),
      href: `/admin/collections/quoteRequests/${doc.id}`,
      ts: new Date(String(doc.createdAt ?? 0)).getTime(),
    })),
    ...recentReviewsAll.docs.map((doc) => ({
      id: `r-${doc.id}`,
      title: doc.status === 'en_attente' ? 'Avis à modérer' : 'Avis reçu',
      detail: `${doc.author ?? ''} · ${doc.rating ?? ''}★`,
      when: relativeWhen(String(doc.createdAt ?? '')),
      href: `/admin/collections/reviews/${doc.id}`,
      ts: new Date(String(doc.createdAt ?? 0)).getTime(),
    })),
  ]
  activityPool.sort((a, b) => b.ts - a.ts)
  const activity = activityPool.slice(0, 6).map(({ ts: _ts, ...rest }) => rest)

  const pendingReviews: DashboardReview[] = pendingReviewsResult.docs.map((doc) => {
    const media = Array.isArray(doc.media) ? doc.media : []
    const first = media[0]
    let photo: string | null = null
    if (first && typeof first === 'object') {
      const url = (first as { url?: string | null }).url
      photo = typeof url === 'string' && url ? url : null
    }
    return {
      id: doc.id,
      author: String(doc.author ?? ''),
      rating: Number(doc.rating ?? 0),
      text: String(doc.text ?? '').slice(0, 120),
      photo,
      href: `/admin/collections/reviews/${doc.id}`,
    }
  })

  return {
    weekLabel: formatWeekLabel(start, end),
    metrics: [
      {
        key: 'week',
        label: 'Réservations cette semaine',
        value: weekTotal,
        hint: deltaHint(weekTotal, prevWeekTotal),
        tone: 'blue',
      },
      {
        key: 'pending',
        label: 'En attente',
        value: pending,
        hint: pendingNewThisWeek > 0 ? `+${pendingNewThisWeek} nouvelles` : null,
        tone: 'orange',
      },
      {
        key: 'confirmed',
        label: 'Confirmées',
        value: confirmedWeek,
        hint: deltaHint(confirmedWeek, prevConfirmedWeek),
        tone: 'green',
      },
      {
        key: 'done',
        label: 'Terminées',
        value: doneWeek,
        hint: 'Cette semaine',
        tone: 'slate',
      },
    ],
    recentBookings,
    weekBars,
    activity,
    pendingReviews,
    pendingReviewCount: pendingReviewsResult.totalDocs,
  }
}

