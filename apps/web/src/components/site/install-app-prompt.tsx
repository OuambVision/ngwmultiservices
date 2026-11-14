'use client'

import { Download, Share, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { site } from '@/config/site'

const STORAGE_KEY = 'ngw-install-prompt-dismissed'
const SHOW_DELAY_MS = 1800
/** Réaffiche le prompt 7 jours après « Plus tard » / fermeture. */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isSnoozed() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw || raw === '1') return false
  const at = Number(raw)
  if (!Number.isFinite(at)) return false
  return Date.now() - at < SNOOZE_MS
}

function snooze() {
  window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

export function InstallAppPrompt() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone() || isSnoozed()) return

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const timer = window.setTimeout(() => {
      if (isStandalone() || isSnoozed()) return
      setVisible(true)
      if (isIos()) setIosHelp(true)
    }, SHOW_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  function dismiss() {
    snooze()
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

  if (!visible) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition duration-500 sm:px-4"
      role="dialog"
      aria-label={t('install.title')}
    >
      <div className="mx-auto flex w-full max-w-lg items-start gap-3 rounded-2xl border border-navy/10 bg-white/95 p-3 shadow-[0_18px_40px_rgba(7,27,75,0.22)] backdrop-blur-md sm:p-4">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="mt-0.5 size-11 shrink-0 rounded-xl ring-1 ring-navy/10"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1e2b6e]">{t('install.title')}</p>
          <p className="mt-0.5 text-xs leading-5 text-navy/65">{t('install.text', { name: site.name })}</p>
          {iosHelp ? (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-navy/70">
              <Share className="mt-0.5 size-3.5 shrink-0 text-action" aria-hidden />
              <span>{t('install.iosHint')}</span>
            </p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {!iosHelp || deferred ? (
              <button
                type="button"
                onClick={() => void install()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white"
              >
                <Download className="size-3.5" aria-hidden />
                {t('install.action')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-navy/60 hover:bg-canvas"
            >
              {t('install.later')}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-navy/45 hover:bg-canvas hover:text-navy"
          aria-label={t('install.close')}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
