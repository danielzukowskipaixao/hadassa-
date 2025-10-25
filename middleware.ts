import { NextResponse, type NextRequest } from 'next/server'
import { createClientServer } from '@/lib/supabase-server'

const PROTECTED_PREFIXES = ['/admin']

export async function middleware(req: NextRequest) {
  const url = new URL(req.url)
  if (PROTECTED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    const supabase = createClientServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
