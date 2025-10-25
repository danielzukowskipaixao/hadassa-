import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isEmailAllowedToWrite } from '@/lib/auth'
import { PhraseCreateSchema } from '@/lib/zodSchemas'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  // If DB is not configured yet, return empty list gracefully (dev-friendly)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ items: [], nextCursor: null })
  }
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)

  const phrases = await prisma.phrase.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  let nextCursor: string | null = null
  if (phrases.length > limit) {
    const next = phrases.pop()!
    nextCursor = next.id
  }
  return NextResponse.json({ items: phrases, nextCursor })
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl) {
    return new NextResponse('Service Unavailable: configure DATABASE_URL', { status: 503 })
  }
  const hasGate = req.cookies.get('hadassa_gate_ok')?.value === '1'
  let writerUserId: string | null = null

  // If passed the gate, auto-authorize and attribute to a persistent "Gate User"
  if (hasGate) {
    const gateEmail = 'gate@local'
    const gate = await prisma.user.upsert({
      where: { email: gateEmail },
      update: {},
      create: { email: gateEmail, name: 'Gate User', role: 'admin' }
    })
    writerUserId = gate.id
  } else {
    // Fallback to Supabase auth + whitelist if no gate cookie
    const user = await getCurrentUser()
    if (!user || !isEmailAllowedToWrite(user.email)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    writerUserId = user.id
  }
  const json = await req.json()
  const parsed = PhraseCreateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const created = await prisma.phrase.create({
    data: { text: parsed.data.text, isPublic: parsed.data.isPublic, userId: writerUserId! },
  })
  return NextResponse.json(created)
}
