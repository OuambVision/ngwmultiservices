'use client'

import React, { FormEvent, useState } from 'react'

/** Recherche globale vers les réservations (maquette 10). */
export function HeaderSearch() {
  const [q, setQ] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = q.trim()
    const params = new URLSearchParams()
    if (value) params.set('search', value)
    window.location.href = `/admin/collections/bookings${params.toString() ? `?${params}` : ''}`
  }

  return (
    <form className="ngw-header-search" onSubmit={onSubmit} role="search">
      <input
        aria-label="Rechercher une réservation, un client, un service"
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher une réservation, un client, un service…"
        type="search"
        value={q}
      />
      <button aria-label="Rechercher" type="submit">
        <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm8.5 2-4.2-4.2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>
    </form>
  )
}
