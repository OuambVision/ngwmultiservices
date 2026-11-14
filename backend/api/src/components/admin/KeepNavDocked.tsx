'use client'

import { useNav } from '@payloadcms/ui'
import React, { useEffect, useRef } from 'react'

/**
 * Seuil unique = `--ngw-nav-docked-min` / 860px (CSS + JS).
 *
 * - ≥ 860 : sidebar dockée ; on contrecarre la fermeture Payload (≤1440).
 * - Passage < 860 : on ferme proprement (hamburger) — pas d’overlay forcé au resize.
 * - < 860 : l’utilisateur ouvre/ferme l’overlay lui-même (croix / clic extérieur).
 */
export const NGW_NAV_DOCKED_MIN = 860

export function KeepNavDocked({ children }: { children: React.ReactNode }) {
  const { navOpen, setNavOpen } = useNav()
  /** Réduction manuelle en mode docké uniquement. */
  const userCollapsed = useRef(false)
  const prevWidth = useRef<number | null>(null)
  const reopenTimers = useRef<number[]>([])

  const clearReopenTimers = () => {
    reopenTimers.current.forEach((id) => window.clearTimeout(id))
    reopenTimers.current = []
  }

  useEffect(() => {
    const syncOverlayClass = () => {
      const overlayOpen = navOpen && window.innerWidth < NGW_NAV_DOCKED_MIN
      document.body.classList.toggle('ngw-nav-overlay-open', overlayOpen)
    }
    syncOverlayClass()
    window.addEventListener('resize', syncOverlayClass)
    return () => {
      window.removeEventListener('resize', syncOverlayClass)
      document.body.classList.remove('ngw-nav-overlay-open')
    }
  }, [navOpen])

  // Clic toggler en zone dockée = intention de réduire / rouvrir
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (window.innerWidth < NGW_NAV_DOCKED_MIN) return
      const target = event.target as HTMLElement | null
      if (!target?.closest('.nav-toggler, .nav__mobile-close')) return
      userCollapsed.current = navOpen
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [navOpen])

  useEffect(() => {
    const keepDockedOpen = () => {
      if (window.innerWidth < NGW_NAV_DOCKED_MIN) return
      if (userCollapsed.current) return
      setNavOpen(true)
    }

    const scheduleKeepDockedOpen = () => {
      if (window.innerWidth < NGW_NAV_DOCKED_MIN) return
      if (userCollapsed.current) return
      clearReopenTimers()
      keepDockedOpen()
      reopenTimers.current = [0, 50, 100, 200, 400].map((ms) =>
        window.setTimeout(keepDockedOpen, ms),
      )
    }

    const syncResize = () => {
      const width = window.innerWidth
      const previous = prevWidth.current
      prevWidth.current = width
      const docked = width >= NGW_NAV_DOCKED_MIN
      const wasDocked = previous != null && previous >= NGW_NAV_DOCKED_MIN

      // Retour en zone dockée depuis l’overlay → rouvrir la sidebar
      if (docked && previous != null && !wasDocked) {
        userCollapsed.current = false
        scheduleKeepDockedOpen()
        return
      }

      // Zone dockée : maintenir ouvert face à Payload
      if (docked) {
        scheduleKeepDockedOpen()
        return
      }

      // Sortie du docké → fermer (hamburger), éviter le flash overlay collé
      if (wasDocked) {
        clearReopenTimers()
        setNavOpen(false)
        return
      }

      // Déjà < 860 : ne pas forcer l’état pendant le resize
      clearReopenTimers()
    }

    prevWidth.current = window.innerWidth
    if (window.innerWidth >= NGW_NAV_DOCKED_MIN) scheduleKeepDockedOpen()

    window.addEventListener('resize', syncResize)
    return () => {
      clearReopenTimers()
      window.removeEventListener('resize', syncResize)
    }
  }, [setNavOpen])

  // Overlay < 860 : clic hors nav → fermer
  useEffect(() => {
    if (!navOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (window.innerWidth >= NGW_NAV_DOCKED_MIN) return
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest('.nav')) return
      if (target.closest('.nav-toggler')) return
      clearReopenTimers()
      setNavOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [navOpen, setNavOpen])

  return children
}
