import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { GeistMono, GeistSans } from '@/lib/fonts'
import { Providers } from '@/providers'

import './globals.css'

export const metadata: Metadata = {
  title: 'ngwmultiservices',
  description: 'Site public',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
