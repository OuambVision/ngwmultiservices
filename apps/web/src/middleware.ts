import { NextResponse, type NextRequest } from 'next/server'

import { localeCookie, localeMaxAge, resolveLocale } from '@/i18n/locale'

export function middleware(request: NextRequest) {
  const current = request.cookies.get(localeCookie)?.value
  const locale = resolveLocale(current, request.headers.get('accept-language'))
  const response = NextResponse.next()
  if (current !== locale) {
    response.cookies.set(localeCookie, locale, {
      path: '/',
      maxAge: localeMaxAge,
      sameSite: 'lax',
    })
  }
  return response
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|manifest.webmanifest|icon(?:-.*)?\\.png|apple-icon\\.png|icons/).*)'],
}
