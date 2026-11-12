import React from 'react'

import './globals.css'

export const metadata = {
  title: 'ngwmultiservices',
  description: 'API Payload',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
