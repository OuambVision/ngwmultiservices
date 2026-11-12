import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * CORS for custom Next routes under /api/custom.
 * Payload REST sets its own CORS. Do not match those routes here.
 */
function allowedOrigins() {
  return [process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3001', process.env.CLIENT_URLS]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

function applyCors(response: NextResponse, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Vary', 'Origin')
  return response
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowed = origin !== null && allowedOrigins().includes(origin)

  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    if (allowed && origin) {
      applyCors(response, origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    return response
  }

  const response = NextResponse.next()
  if (allowed && origin) applyCors(response, origin)
  return response
}

export const config = {
  matcher: ['/api/custom/:path*'],
}
