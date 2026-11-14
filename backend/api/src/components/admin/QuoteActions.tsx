'use client'

import React from 'react'

import { StatusQuickActions } from './StatusQuickActions'

/** Actions rapides sur une demande de devis. */
export function QuoteActions() {
  return (
    <StatusQuickActions
      actions={[
        {
          label: 'En traitement',
          value: 'en_traitement',
          hideWhen: ['en_traitement', 'traitee', 'annulee'],
          buttonStyle: 'secondary',
        },
        {
          label: 'Marquer traitée',
          value: 'traitee',
          hideWhen: ['traitee', 'annulee'],
          buttonStyle: 'primary',
        },
        {
          label: 'Annuler',
          value: 'annulee',
          hideWhen: 'annulee',
          buttonStyle: 'error',
        },
      ]}
      successMessage="Demande de devis mise à jour."
    />
  )
}
