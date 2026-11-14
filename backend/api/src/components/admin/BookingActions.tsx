'use client'

import React from 'react'

import { StatusQuickActions } from './StatusQuickActions'

/** Actions rapides sur une réservation : confirmer ou annuler. */
export function BookingActions() {
  return (
    <StatusQuickActions
      actions={[
        {
          label: 'Confirmer',
          value: 'confirmee',
          hideWhen: ['confirmee', 'annulee', 'terminee'],
          buttonStyle: 'primary',
        },
        {
          label: 'Annuler',
          value: 'annulee',
          hideWhen: 'annulee',
          buttonStyle: 'error',
        },
      ]}
      successMessage="Réservation mise à jour."
    />
  )
}
