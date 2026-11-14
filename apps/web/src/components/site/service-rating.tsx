'use client'

import { Star } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const starSize = {
  md: 'size-4',
  sm: 'size-3.5',
  xs: 'size-3',
} as const

export function StarRow({
  label,
  size = 'sm',
  value,
}: {
  label?: string
  size?: keyof typeof starSize
  value: number
}) {
  const box = starSize[size]
  return (
    <span className="inline-flex gap-px" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index))
        return (
          <span key={index} className={`relative inline-flex ${box}`} aria-hidden>
            <Star className={`${box} text-navy/15`} strokeWidth={1.75} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${box} fill-highlight text-highlight`} strokeWidth={1.75} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function ServiceRating({
  average,
  className,
  count,
  href,
  size = 'sm',
}: {
  average: number
  className?: string
  count: number
  href?: string
  size?: keyof typeof starSize
}) {
  const { i18n, t } = useTranslation()
  if (count < 1) return null
  const locale = i18n.language.startsWith('en') ? 'en-CA' : 'fr-CA'
  const score = average.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })
  const countLabel = count === 1 ? t('services.oneReview') : t('services.reviewCount', { count })
  const label = t('services.ratingLabel', { score, count: countLabel })
  const text = size === 'md' ? 'text-sm' : size === 'xs' ? 'text-[11px]' : 'text-xs'
  const classNames = `inline-flex items-center gap-1 rounded-md ${text} font-semibold text-[#1e2b6e] ${href ? 'hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action' : ''} ${className ?? ''}`
  const content = (
    <>
      <StarRow size={size} value={average} />
      <span className="tabular-nums">{score}</span>
      <span className="font-medium text-navy/50">({count})</span>
    </>
  )
  if (!href) {
    return (
      <span className={classNames} aria-label={label}>
        {content}
      </span>
    )
  }
  return (
    <Link href={href} aria-label={label} className={classNames}>
      {content}
    </Link>
  )
}
