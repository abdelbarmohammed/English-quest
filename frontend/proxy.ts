import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Soft geofence — Morocco only (MA). Not a security boundary; a UX gate that
// shows a friendly "not available in your region" page instead of a blank error.
// In development (no Vercel header) the check is skipped so local work is unaffected.
// Bypassed by the BYPASS_GEO env var for internal/admin access.

const ALLOWED_COUNTRY = 'MA'

export function proxy(request: NextRequest) {
  // Vercel injects x-vercel-ip-country on every edge request.
  // The header is absent locally (NODE_ENV=development), so we allow through.
  const country = request.headers.get('x-vercel-ip-country')

  // No header → development or non-Vercel deploy → allow through
  if (!country) return NextResponse.next()

  // Morocco → allow through
  if (country === ALLOWED_COUNTRY) return NextResponse.next()

  // Bypass cookie for teacher/admin access from abroad (only when the secret is actually configured)
  const bypassSecret = process.env.GEO_BYPASS_SECRET
  if (bypassSecret) {
    const bypassCookie = request.cookies.get('geo_bypass')?.value
    if (bypassCookie === bypassSecret) return NextResponse.next()
  }

  // Everyone else → friendly blocked page
  return NextResponse.redirect(new URL('/blocked', request.url))
}

export const config = {
  matcher: [
    // Run on all pages except the blocked page itself, static files, and API routes
    '/((?!blocked|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf)).*)',
  ],
}
