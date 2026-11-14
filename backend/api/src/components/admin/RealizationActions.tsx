'use client'

import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

/** Afficher ou masquer une réalisation sur le site. */
export function RealizationActions() {
  const { id, collectionSlug } = useDocumentInfo()
  const published = useFormFields(([fields]) => Boolean(fields.published?.value))
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (!id || !collectionSlug) return null

  const apply = async (next: boolean) => {
    setBusy(true)
    try {
      const response = await fetch(`/api/${collectionSlug}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      const payload = (await response.json().catch(() => null)) as {
        errors?: Array<{ message?: string }>
      } | null
      if (!response.ok) {
        throw new Error(payload?.errors?.[0]?.message || 'La mise à jour a échoué.')
      }
      toast.success(next ? 'Réalisation affichée sur le site.' : 'Réalisation masquée.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'La mise à jour a échoué.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {published ? (
        <Button buttonStyle="secondary" disabled={busy} onClick={() => void apply(false)} size="small" type="button">
          Masquer du site
        </Button>
      ) : (
        <Button buttonStyle="primary" disabled={busy} onClick={() => void apply(true)} size="small" type="button">
          Afficher sur le site
        </Button>
      )}
    </div>
  )
}
