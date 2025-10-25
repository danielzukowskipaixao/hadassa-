import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isEmailAllowedToWrite } from '@/lib/auth'
import { PhraseCreateSchema } from '@/lib/zodSchemas'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
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
  const user = await getCurrentUser()
  if (!user || !isEmailAllowedToWrite(user.email)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const json = await req.json()
  const parsed = PhraseCreateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const created = await prisma.phrase.create({
    data: { text: parsed.data.text, isPublic: parsed.data.isPublic, userId: user.id },
  })
  return NextResponse.json(created)
}
