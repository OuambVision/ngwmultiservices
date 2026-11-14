'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

async function countWhere(api: string, collection: string, where: Record<string, unknown>) {
  const params = new URLSearchParams({ limit: '0', depth: '0', where: JSON.stringify(where) })
  const res = await fetch(`${api}/${collection}?${params}`, { credentials: 'include' })
  if (!res.ok) return 0
  const data = (await res.json()) as { totalDocs?: number }
  return data.totalDocs ?? 0
}

/** Pastille de notifications = demandes et avis en attente. */
export function HeaderNotifications() {
  const { config } = useConfig()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const api = config.routes.api
    let cancelled = false
    void (async () => {
      const [bookings, reviews, quotes] = await Promise.all([
        countWhere(api, 'bookings', { status: { equals: 'en_attente' } }),
        countWhere(api, 'reviews', { status: { equals: 'en_attente' } }),
        countWhere(api, 'quoteRequests', { status: { equals: 'recue' } }),
      ])
      if (!cancelled) setCount(bookings + reviews + quotes)
    })()
    return () => {
      cancelled = true
    }
  }, [config.routes.api])

  return (
    <a
      aria-label={count != null ? `${count} éléments à traiter` : 'Notifications'}
      className="ngw-header-bell"
      href="/admin"
      title="Éléments à traiter"
    >
      <span aria-hidden className="ngw-header-bell__icon">
        <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      {count != null && count > 0 ? <span className="ngw-header-bell__badge">{count > 99 ? '99+' : count}</span> : null}
    </a>
  )
}
