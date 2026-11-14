'use client'

import React from 'react'

import { StatusQuickActions } from './StatusQuickActions'

/** Modération rapide d’un avis. */
export function ReviewActions() {
  return (
    <StatusQuickActions
      actions={[
        {
          label: 'Publier',
          value: 'publie',
          hideWhen: 'publie',
          buttonStyle: 'primary',
        },
        {
          label: 'Refuser',
          value: 'refuse',
          hideWhen: 'refuse',
          buttonStyle: 'error',
        },
      ]}
      successMessage="Avis mis à jour."
    />
  )
}
