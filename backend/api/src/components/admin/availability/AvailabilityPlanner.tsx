'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Gutter, useConfig } from '@payloadcms/ui'

import './availability-planner.scss'

type Weekday = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'

type DaySchedule = {
  enabled: boolean
  endTime: string
  slotMinutes: number
  startTime: string
}

type Closure = {
  blockEnd?: string
  blockStart?: string
  date: string
  dateEnd?: string
  id?: number
}

const WEEK: Weekday[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const LABELS: Record<Weekday, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
}

const defaultDay = (): DaySchedule => ({
  enabled: false,
  startTime: '08:00',
  endTime: '17:00',
  slotMinutes: 60,
})

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1))
  const startPad = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: Array<string | null> = []
  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.errors?.[0]?.message || body?.message || `Erreur ${response.status}`)
  }
  if (response.status === 204) return null
  return response.json()
}

export function AvailabilityPlanner() {
  const { config } = useConfig()
  const apiRoute = config.routes.api || '/api'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validFrom, setValidFrom] = useState(todayIso())
  const [validTo, setValidTo] = useState('2027-03-31')
  const [schedule, setSchedule] = useState<Record<Weekday, DaySchedule>>(() => {
    const initial = {} as Record<Weekday, DaySchedule>
    for (const day of WEEK) initial[day] = defaultDay()
    return initial
  })
  const [existingJourIds, setExistingJourIds] = useState<number[]>([])
  const [closures, setClosures] = useState<Closure[]>([])
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() }
  })
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api(`${apiRoute}/availability?limit=500&depth=0&pagination=false`)
      const docs = data?.docs ?? []
      const next = {} as Record<Weekday, DaySchedule>
      for (const day of WEEK) next[day] = defaultDay()
      const jourIds: number[] = []
      let from = todayIso()
      let to = '2027-03-31'
      let sawValidity = false

      for (const doc of docs) {
        if (doc.type === 'jour' && doc.day) {
          jourIds.push(doc.id)
          next[doc.day as Weekday] = {
            enabled: true,
            startTime: doc.startTime || '08:00',
            endTime: doc.endTime || '17:00',
            slotMinutes: doc.slotMinutes || 60,
          }
          if (doc.validFrom) {
            from = String(doc.validFrom).slice(0, 10)
            sawValidity = true
          }
          if (doc.validTo) {
            to = String(doc.validTo).slice(0, 10)
            sawValidity = true
          }
        }
      }

      const nextClosures: Closure[] = docs
        .filter((doc: { type?: string }) => doc.type === 'fermeture')
        .map((doc: Closure & { id: number }) => ({
          id: doc.id,
          date: String(doc.date || '').slice(0, 10),
          dateEnd: doc.dateEnd ? String(doc.dateEnd).slice(0, 10) : undefined,
          blockStart: doc.blockStart || undefined,
          blockEnd: doc.blockEnd || undefined,
        }))
        .filter((row: Closure) => Boolean(row.date))

      setSchedule(next)
      setExistingJourIds(jourIds)
      setClosures(nextClosures)
      if (sawValidity) {
        setValidFrom(from)
        setValidTo(to)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [apiRoute])

  useEffect(() => {
    void load()
  }, [load])

  const closedSet = useMemo(() => {
    const set = new Set<string>()
    for (const row of closures) {
      if (!row.date || (row.blockStart && row.blockEnd)) continue
      const end = row.dateEnd || row.date
      let cursor = row.date
      while (cursor <= end) {
        set.add(cursor)
        const [y, m, d] = cursor.split('-').map(Number)
        const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
        if (next === cursor) break
        cursor = next
      }
    }
    return set
  }, [closures])

  const cells = useMemo(
    () => monthMatrix(monthCursor.year, monthCursor.month),
    [monthCursor.month, monthCursor.year],
  )

  const updateDay = (day: Weekday, patch: Partial<DaySchedule>) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  const onDayClick = (iso: string, shiftKey: boolean) => {
    if (shiftKey && rangeAnchor) {
      const start = rangeAnchor < iso ? rangeAnchor : iso
      const end = rangeAnchor < iso ? iso : rangeAnchor
      setClosures((prev) => [
        ...prev.filter((row) => row.blockStart || row.date < start || (row.dateEnd || row.date) > end),
        { date: start, dateEnd: end === start ? undefined : end },
      ])
      setRangeAnchor(null)
      return
    }

    if (closedSet.has(iso)) {
      setClosures((prev) =>
        prev.filter((row) => {
          if (row.blockStart) return true
          const end = row.dateEnd || row.date
          return !(iso >= row.date && iso <= end)
        }),
      )
      setRangeAnchor(null)
      return
    }

    if (rangeAnchor) {
      const start = rangeAnchor < iso ? rangeAnchor : iso
      const end = rangeAnchor < iso ? iso : rangeAnchor
      setClosures((prev) => [...prev, { date: start, dateEnd: end === start ? undefined : end }])
      setRangeAnchor(null)
      return
    }

    setRangeAnchor(iso)
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      for (const id of existingJourIds) {
        await api(`${apiRoute}/availability/${id}`, { method: 'DELETE' })
      }

      const createdIds: number[] = []
      for (const day of WEEK) {
        const row = schedule[day]
        if (!row.enabled) continue
        const created = await api(`${apiRoute}/availability`, {
          method: 'POST',
          body: JSON.stringify({
            type: 'jour',
            day,
            startTime: row.startTime,
            endTime: row.endTime,
            slotMinutes: row.slotMinutes,
            validFrom,
            validTo,
          }),
        })
        if (created?.doc?.id) createdIds.push(created.doc.id)
      }

      const previous = await api(
        `${apiRoute}/availability?where[type][equals]=fermeture&limit=500&depth=0`,
      )
      for (const doc of previous?.docs ?? []) {
        await api(`${apiRoute}/availability/${doc.id}`, { method: 'DELETE' })
      }
      for (const row of closures) {
        if (!row.date) continue
        await api(`${apiRoute}/availability`, {
          method: 'POST',
          body: JSON.stringify({
            type: 'fermeture',
            date: row.date,
            dateEnd: row.dateEnd || undefined,
            blockStart: row.blockStart || undefined,
            blockEnd: row.blockEnd || undefined,
          }),
        })
      }

      setExistingJourIds(createdIds)
      setMessage('Planning enregistré. Les créneaux publics sont à jour.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Gutter className="ngw-planner">
      <header className="ngw-planner__header">
        <div>
          <p className="ngw-planner__eyebrow">Planning</p>
          <h1>Disponibilités</h1>
          <p className="ngw-planner__lead">
            Définissez vos horaires sur une période (ex. jusqu’à mars 2027), puis marquez les jours
            fermés. Un créneau réservé disparaît automatiquement.
          </p>
        </div>
        <div className="ngw-planner__actions">
          <a className="ngw-planner__ghost" href="/admin/collections/availability">
            Vue liste avancée
          </a>
          <button
            type="button"
            className="ngw-planner__save"
            disabled={saving || loading}
            onClick={() => void save()}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer le planning'}
          </button>
        </div>
      </header>

      {message ? <p className="ngw-planner__ok">{message}</p> : null}
      {error ? <p className="ngw-planner__err">{error}</p> : null}
      {loading ? <p>Chargement du planning…</p> : null}

      <section className="ngw-planner__card">
        <h2>Période de validité</h2>
        <p className="ngw-planner__hint">Les horaires s’appliquent uniquement dans cette fenêtre.</p>
        <div className="ngw-planner__row">
          <label>
            Du
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </label>
          <label>
            Au
            <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="ngw-planner__card">
        <div className="ngw-planner__card-head">
          <h2>Horaires hebdomadaires</h2>
          <button
            type="button"
            className="ngw-planner__linkish"
            onClick={() => {
              const source = schedule.lundi
              setSchedule((prev) => {
                const next = { ...prev }
                for (const day of ['mardi', 'mercredi', 'jeudi', 'vendredi'] as Weekday[]) {
                  next[day] = { ...source }
                }
                return next
              })
            }}
          >
            Copier lundi → ven.
          </button>
        </div>
        <div className="ngw-planner__week">
          {WEEK.map((day) => {
            const row = schedule[day]
            return (
              <div key={day} className={`ngw-planner__day ${row.enabled ? 'is-on' : ''}`}>
                <label className="ngw-planner__day-toggle">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => updateDay(day, { enabled: e.target.checked })}
                  />
                  <span>{LABELS[day]}</span>
                </label>
                <div className="ngw-planner__day-fields">
                  <input
                    type="time"
                    disabled={!row.enabled}
                    value={row.startTime}
                    onChange={(e) => updateDay(day, { startTime: e.target.value })}
                  />
                  <span>→</span>
                  <input
                    type="time"
                    disabled={!row.enabled}
                    value={row.endTime}
                    onChange={(e) => updateDay(day, { endTime: e.target.value })}
                  />
                  <select
                    disabled={!row.enabled}
                    value={row.slotMinutes}
                    onChange={(e) => updateDay(day, { slotMinutes: Number(e.target.value) })}
                    aria-label="Durée de créneau"
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="ngw-planner__card">
        <div className="ngw-planner__card-head">
          <h2>Fermetures</h2>
          <div className="ngw-planner__month-nav">
            <button
              type="button"
              onClick={() =>
                setMonthCursor((prev) => {
                  const date = new Date(Date.UTC(prev.year, prev.month - 1, 1))
                  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
                })
              }
            >
              ‹
            </button>
            <strong>
              {new Date(Date.UTC(monthCursor.year, monthCursor.month, 1)).toLocaleDateString('fr-CA', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </strong>
            <button
              type="button"
              onClick={() =>
                setMonthCursor((prev) => {
                  const date = new Date(Date.UTC(prev.year, prev.month + 1, 1))
                  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
                })
              }
            >
              ›
            </button>
          </div>
        </div>
        <p className="ngw-planner__hint">
          1er clic = début, 2e clic = fin de période fermée. Clic sur un jour fermé = le rouvrir.
          Maj+clic prolonge depuis l’ancre.
          {rangeAnchor ? ` Ancre : ${rangeAnchor}` : ''}
        </p>
        <div className="ngw-planner__cal-head">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="ngw-planner__cal">
          {cells.map((iso, index) =>
            iso ? (
              <button
                key={iso}
                type="button"
                className={`ngw-planner__cell ${closedSet.has(iso) ? 'is-closed' : ''} ${rangeAnchor === iso ? 'is-range' : ''}`}
                onClick={(event) => onDayClick(iso, event.shiftKey)}
              >
                {Number(iso.slice(8, 10))}
              </button>
            ) : (
              <span key={`empty-${index}`} className="ngw-planner__cell is-empty" />
            ),
          )}
        </div>
        <div className="ngw-planner__legend">
          <span>
            <i className="is-closed" /> Fermé
          </span>
          <span>
            <i /> Ouvert selon horaire
          </span>
          <button type="button" className="ngw-planner__linkish" onClick={() => setRangeAnchor(null)}>
            Annuler ancre
          </button>
        </div>
      </section>
    </Gutter>
  )
}

export default AvailabilityPlanner
