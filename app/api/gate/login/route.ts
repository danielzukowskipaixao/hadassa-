import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

const COOKIE_NAME = 'hadassa_gate_ok'
const MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const rl = rateLimit(`gate:${ip}`, 10, 10 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.retryAfter || 0) / 1000)) } })
  }

  const body = await req.json().catch(() => null) as { password?: string } | null
  const password = (body?.password || '').toString()

    const expected = process.env.GATE_PASSWORD || '141025'
  if (password !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: '1',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
  })
  return res
}
