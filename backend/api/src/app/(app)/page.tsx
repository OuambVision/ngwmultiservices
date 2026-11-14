import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const jar = await cookies()
  const signedIn = Boolean(jar.get('payload-token')?.value)
  redirect(signedIn ? '/admin' : '/admin/login')
}
