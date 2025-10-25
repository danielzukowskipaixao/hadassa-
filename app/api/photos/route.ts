import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isEmailAllowedToWrite } from '@/lib/auth'
import { PhotoCreateSchema } from '@/lib/zodSchemas'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  // If DB is not configured yet, return empty list gracefully (dev-friendly)
  if (!dbUrl) {
    return NextResponse.json({ items: [], nextCursor: null })
  }
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)

  const photos = await prisma.photo.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  let nextCursor: string | null = null
  if (photos.length > limit) {
    const next = photos.pop()!
    nextCursor = next.id
  }
  return NextResponse.json({ items: photos, nextCursor })
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl) {
    return new NextResponse('Service Unavailable: configure DATABASE_URL', { status: 503 })
  }
  // Public writes: attribute all photo creations to a persistent "Public User"
  const publicEmail = 'public@local'
  const publicUser = await prisma.user.upsert({
    where: { email: publicEmail },
    update: {},
    create: { email: publicEmail, name: 'Public User', role: 'user' }
  })
  const writerUserId: string = publicUser.id
  const json = await req.json()
  const parsed = PhotoCreateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { url, thumbUrl, caption, isPublic } = parsed.data
  const created = await prisma.photo.create({
    data: { url, thumbUrl: thumbUrl ?? null, caption: caption ?? null, isPublic, userId: writerUserId },
  })
  return NextResponse.json(created)
}
