'use client'

import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'ngw-admin-install-dismissed'
const SHOW_DELAY_MS = 2000

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 1023px)').matches
}

/** Injecte le manifest / meta installables + petit prompt mobile. */
export function InstallableAdmin({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const tags: HTMLElement[] = []

    function ensureLink(rel: string, href: string, attrs: Record<string, string> = {}) {
      const existing = document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)
      if (existing) return
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      for (const [key, value] of Object.entries(attrs)) link.setAttribute(key, value)
      document.head.appendChild(link)
      tags.push(link)
    }

    function ensureMeta(name: string, content: string) {
      const existing = document.head.querySelector(`meta[name="${name}"]`)
      if (existing) {
        existing.setAttribute('content', content)
        return
      }
      const meta = document.createElement('meta')
      meta.name = name
      meta.content = content
      document.head.appendChild(meta)
      tags.push(meta)
    }

    ensureLink('manifest', '/site.webmanifest')
    ensureLink('apple-touch-icon', '/apple-icon.png')
    ensureLink('icon', '/icons/icon-192.png', { type: 'image/png', sizes: '192x192' })
    ensureLink('icon', '/icons/icon-512.png', { type: 'image/png', sizes: '512x512' })
    ensureMeta('theme-color', '#071b4b')
    ensureMeta('mobile-web-app-capable', 'yes')
    ensureMeta('apple-mobile-web-app-capable', 'yes')
    ensureMeta('apple-mobile-web-app-title', 'NGW Admin')
    ensureMeta('apple-mobile-web-app-status-bar-style', 'default')

    if (isStandalone() || !isMobileViewport() || window.localStorage.getItem(STORAGE_KEY) === '1') {
      return () => {
        for (const tag of tags) tag.remove()
      }
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const timer = window.setTimeout(() => {
      if (isStandalone() || !isMobileViewport()) return
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return
      setVisible(true)
      if (isIos()) setIosHelp(true)
    }, SHOW_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      for (const tag of tags) tag.remove()
    }
  }, [])

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferred) {
      setIosHelp(true)
      return
    }
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    if (choice.outcome === 'accepted') dismiss()
    else setVisible(false)
  }

  return (
    <>
      {children}
      {visible ? (
        <div
          style={{
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 'max(12px, env(safe-area-inset-bottom))',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: 12,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.97)',
              boxShadow: '0 18px 40px rgba(7,27,75,0.22)',
              border: '1px solid rgba(7,27,75,0.1)',
            }}
          >
            <img
              src="/icons/icon-192.png"
              alt=""
              width={44}
              height={44}
              style={{ borderRadius: 12, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e2b6e' }}>Installer NGW Admin</div>
              <div style={{ marginTop: 2, fontSize: 12, lineHeight: 1.4, color: 'rgba(7,27,75,0.65)' }}>
                Accédez plus vite au panneau d’administration depuis votre écran d’accueil.
              </div>
              {iosHelp ? (
                <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(7,27,75,0.7)' }}>
                  Sur iPhone : Partager → « Sur l’écran d’accueil ».
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {!iosHelp || deferred ? (
                  <button
                    type="button"
                    onClick={() => void install()}
                    style={{
                      border: 0,
                      borderRadius: 10,
                      padding: '7px 12px',
                      background: '#e52329',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Installer
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={dismiss}
                  style={{
                    border: 0,
                    borderRadius: 10,
                    padding: '7px 12px',
                    background: 'transparent',
                    color: 'rgba(7,27,75,0.55)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              style={{
                border: 0,
                background: 'transparent',
                color: 'rgba(7,27,75,0.45)',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
