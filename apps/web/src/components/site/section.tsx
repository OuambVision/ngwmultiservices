import Image from 'next/image'
import type { ReactNode } from 'react'

import { ScrollReveal } from '@/components/site/scroll-reveal'

type SectionHeadingProps = {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  as?: 'h1' | 'h2'
  tone?: 'navy' | 'light'
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  as = 'h2',
  tone = 'navy',
}: SectionHeadingProps) {
  const Title = as
  const light = tone === 'light'
  const titleClass =
    as === 'h1'
      ? `mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:mt-4 sm:text-5xl ${light ? 'text-white' : 'text-navy'}`
      : `mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:mt-4 sm:text-3xl lg:text-4xl ${light ? 'text-white' : 'text-navy'}`

  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={`flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase ${light ? 'text-white/80' : 'text-action'}`}
        >
          <span className="h-0.5 w-8 shrink-0 bg-highlight" aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      <Title id={id} className={titleClass}>
        {title}
      </Title>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl text-lg leading-8 ${light ? 'text-white/85' : 'text-navy/75'}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

type SectionProps = {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
  bleed?: boolean
  backgroundImage?: string
  className?: string
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  bleed = false,
  backgroundImage,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titre`}
      className={`relative isolate scroll-mt-20 overflow-hidden py-14 sm:py-20 lg:py-32 ${className ?? ''}`}
    >
      {backgroundImage ? (
        <div aria-hidden className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#071b4b]/42" />
        </div>
      ) : null}
      <div className="relative mx-auto max-w-[90rem] px-5 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            id={`${id}-titre`}
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            tone={backgroundImage ? 'light' : 'navy'}
          />
        </ScrollReveal>
      </div>
      {children ? (
        <div
          className={
            bleed
              ? 'relative mt-2 lg:mt-3'
              : 'relative mx-auto mt-10 max-w-[90rem] px-5 sm:px-6 lg:mt-12'
          }
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}
