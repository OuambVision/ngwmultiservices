import { SectionHeading } from '@/components/site/section'

type PagePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-24 sm:px-6 lg:py-32">
      <SectionHeading as="h1" eyebrow={eyebrow} title={title} subtitle={description} />
    </section>
  )
}
