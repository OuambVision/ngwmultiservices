type PagePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold tracking-[0.14em] text-action uppercase">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-navy/75">{description}</p>
    </section>
  )
}
