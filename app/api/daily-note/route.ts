import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { DailyNoteUpsertSchema } from '@/lib/zodSchemas'
import { getCurrentUser, isEmailAllowedToWrite } from '@/lib/auth'
import { isFutureDayKey } from '@/lib/date'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl) {
    const { searchParams } = new URL(req.url)
    const dayKey = searchParams.get('dayKey')
    if (!dayKey) return new NextResponse('dayKey required', { status: 400 })
    if (isFutureDayKey(dayKey)) return new NextResponse('Forbidden', { status: 403 })
    // Without DB, just return null so UI does not crash
    return NextResponse.json(null)
  }
  const { searchParams } = new URL(req.url)
  const dayKey = searchParams.get('dayKey')
  if (!dayKey) return new NextResponse('dayKey required', { status: 400 })
  if (isFutureDayKey(dayKey)) return new NextResponse('Forbidden', { status: 403 })
  const note = await prisma.dailyNote.findUnique({ where: { dayKey } })
  return NextResponse.json(note)
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl) {
    return new NextResponse('Service Unavailable: configure DATABASE_URL', { status: 503 })
  }
  const hasGate = req.cookies.get('hadassa_gate_ok')?.value === '1'
  if (!hasGate) {
    const user = await getCurrentUser()
    if (!user || !isEmailAllowedToWrite(user.email)) return new NextResponse('Unauthorized', { status: 401 })
  }

  const json = await req.json()
  const parsed = DailyNoteUpsertSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const { dayKey, title, content, isPublic } = parsed.data
  if (isFutureDayKey(dayKey)) return new NextResponse('Forbidden', { status: 403 })

  const upserted = await prisma.dailyNote.upsert({
    where: { dayKey },
    update: { title: title ?? null, content: content ?? null, isPublic },
    create: { dayKey, title: title ?? null, content: content ?? null, isPublic },
  })
  return NextResponse.json(upserted)
}
