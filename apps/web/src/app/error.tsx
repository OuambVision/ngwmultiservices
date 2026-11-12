'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
      <button className="w-fit underline" type="button" onClick={() => reset()}>
        Réessayer
      </button>
    </main>
  )
}
