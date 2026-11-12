'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-navy">Une erreur est survenue</h1>
      <button
        className="w-fit rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
        type="button"
        onClick={() => reset()}
      >
        Réessayer
      </button>
    </section>
  )
}
