'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export function BackToTop() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label={t('backToTop')}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }}
      className={cn(
        'fixed right-5 bottom-5 z-40 flex size-12 cursor-pointer items-center justify-center rounded-full bg-navy text-white shadow-[0_14px_30px_-12px_rgba(7,27,75,0.75)] ring-1 ring-white/15 transition duration-300 hover:-translate-y-0.5 hover:bg-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:right-6 sm:bottom-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.25} aria-hidden />
    </button>
  )
}
