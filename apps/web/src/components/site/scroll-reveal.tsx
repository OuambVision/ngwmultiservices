'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const scrollRevealClass = (visible: boolean) =>
  cn(
    'transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
    visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-[0.96] opacity-0',
  )

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
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.22, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
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
