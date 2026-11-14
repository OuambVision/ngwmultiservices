import Link from 'next/link'

type Crumb = {
  href?: string
  label: string
}

export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-navy/70">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="text-navy/30">
                  /
                </span>
              ) : null}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="underline-offset-4 hover:text-action hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'font-bold text-[#0c45b0]' : undefined} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
