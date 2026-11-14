'use client'

import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export type StatusAction = {
  label: string
  value: string
  /** Masquer le bouton si le statut courant est déjà cette valeur. */
  hideWhen?: string | string[]
  buttonStyle?: 'primary' | 'secondary' | 'error'
}

type Props = {
  actions: StatusAction[]
  field?: string
  successMessage?: string
}

function matches(current: unknown, candidates: string | string[] | undefined) {
  if (!candidates) return false
  const list = Array.isArray(candidates) ? candidates : [candidates]
  return list.includes(String(current ?? ''))
}

export function StatusQuickActions({
  actions,
  field = 'status',
  successMessage = 'Statut mis à jour.',
}: Props) {
  const { id, collectionSlug } = useDocumentInfo()
  const current = useFormFields(([fields]) => fields[field]?.value)
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (!id || !collectionSlug) return null

  const visible = actions.filter((action) => !matches(current, action.hideWhen ?? action.value))
  if (visible.length === 0) return null

  const apply = async (value: string) => {
    setBusy(true)
    try {
      const response = await fetch(`/api/${collectionSlug}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      const payload = (await response.json().catch(() => null)) as {
        errors?: Array<{ message?: string }>
      } | null
      if (!response.ok) {
        throw new Error(payload?.errors?.[0]?.message || 'La mise à jour a échoué.')
      }
      toast.success(successMessage)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'La mise à jour a échoué.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {visible.map((action) => (
        <Button
          key={action.value}
          buttonStyle={action.buttonStyle ?? 'secondary'}
          disabled={busy}
          onClick={() => void apply(action.value)}
          size="small"
          type="button"
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}
