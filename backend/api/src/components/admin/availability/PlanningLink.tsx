'use client'

import React from 'react'

export function PlanningLink() {
  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '0.85rem 1rem',
        borderRadius: 12,
        background: '#eef4ff',
        border: '1px solid #c9dbff',
      }}
    >
      <strong style={{ color: '#071b4b' }}>Planning type Outlook</strong>
      <p style={{ margin: '0.35rem 0 0.65rem', color: '#334155', fontSize: 14 }}>
        Définissez vos horaires hebdomadaires, la période de validité et les fermetures sur un
        calendrier.
      </p>
      <a
        href="/admin/planning"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#0755f5',
          color: '#fff',
          borderRadius: 8,
          padding: '0.55rem 0.9rem',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Ouvrir le planning
      </a>
    </div>
  )
}
