import { site } from '@/config/site'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type LogoProps = {
  tone?: 'dark' | 'light'
  priority?: 'header' | 'footer'
}

export function Logo({ tone = 'dark', priority = 'footer' }: LogoProps) {
  const word = tone === 'light' ? 'text-white' : 'text-navy'
  const muted = tone === 'light' ? 'text-white/75' : 'text-navy/70'

  return (
    <span className="flex items-center gap-3">
      <Image src="/logo.png" alt={site.name} width={50} height={50} />
      <span className="min-w-0 text-left">
        <span className={cn('block text-lg font-bold leading-none tracking-tight', word)}>
          <span className="text-accent">NGW</span>{' '}
          <span className={tone === 'light' ? 'text-white' : 'text-action'}>MULTISERVICES</span>
        </span>
        <span
          className={cn(
            'mt-0.5 text-[11px] leading-none',
            muted,
            priority === 'header' && 'max-lg:hidden',
          )}
        >
          {site.tagline}
        </span>
      </span>
    </span>
  )
}
