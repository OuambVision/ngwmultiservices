'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const scrollRevealClass = (visible: boolean) =>
  cn(
    'transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]',
    // Pas de scale : casse la lecture des grilles (cartes « fantômes » → 1 colonne visuelle).
    visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
  )

function isInViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  return rect.top < vh * 0.94 && rect.bottom > vh * 0.06
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    // Déjà à l’écran (hydratation / resize) → visible tout de suite, sinon flash « 1 carte ».
    if (isInViewport(node)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
    )
    observer.observe(node)
    const onResize = () => {
      if (isInViewport(node)) {
        setVisible(true)
        observer.disconnect()
      }
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return { ref, visible, className: scrollRevealClass(visible) }
}

type ScrollRevealProps = {
  as?: ElementType
  className?: string
  children: ReactNode
}

export function ScrollReveal({ as: Tag = 'div', className, children }: ScrollRevealProps) {
  const { ref, className: revealClass } = useScrollReveal<HTMLElement>()
  return (
    <Tag ref={ref} className={cn(revealClass, className)}>
      {children}
    </Tag>
  )
}
