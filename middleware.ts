import { NextResponse, type NextRequest } from 'next/server'

// Simple site-wide password gate using a cookie.
const GATE_COOKIE = 'hadassa_gate_ok'

function isPublicPath(pathname: string) {
  if (
    pathname === '/gate' ||
    pathname === '/api/gate/login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/public/')
  ) return true
  return false
}

export async function middleware(req: NextRequest) {
  // Gate disabled: allow all requests without restriction
  return NextResponse.next()
}

// Apply to the entire site
export const config = {
  // Keep matcher but middleware is a no-op now
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
