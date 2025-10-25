import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isEmailAllowedToWrite } from '@/lib/auth'
import { PhraseUpdateSchema } from '@/lib/zodSchemas'

const prisma = new PrismaClient()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || !isEmailAllowedToWrite(user.email)) return new NextResponse('Unauthorized', { status: 401 })

  const json = await req.json()
  const parsed = PhraseUpdateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.phrase.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || !isEmailAllowedToWrite(user.email)) return new NextResponse('Unauthorized', { status: 401 })
  await prisma.phrase.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
