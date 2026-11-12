import { API_PORT, WEB_PORT } from '@repo/config'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-semibold">ngwmultiservices</h1>
      <p>Site public, port {WEB_PORT}. Aucune page métier n’est encore écrite.</p>
      <p>API Payload, port {API_PORT}, administration sur /admin.</p>
    </main>
  )
}
