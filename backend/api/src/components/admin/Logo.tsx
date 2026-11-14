import React from 'react'

/** Lockup NGW pour l’écran de connexion. */
export default function Logo() {
  return (
    <span className="ngw-logo">
      <img alt="" height={88} src="/logo.png" width={88} />
      <span className="ngw-logo__text">
        <span className="ngw-logo__name">
          <span className="ngw-logo__ngw">NGW</span>{' '}
          <span className="ngw-logo__multi">MULTISERVICES</span>
        </span>
        <span className="ngw-logo__tagline">Cleaning · Moving · Maintenance</span>
      </span>
    </span>
  )
}
