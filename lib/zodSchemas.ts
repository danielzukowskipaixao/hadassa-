import { z } from 'zod'

export const PhotoCreateSchema = z.object({
  url: z.string().url(),
  thumbUrl: z.string().url().optional().nullable(),
  caption: z.string().max(200).optional().nullable(),
  isPublic: z.boolean().default(true),
})

export const PhraseCreateSchema = z.object({
  text: z.string().min(1).max(400),
  isPublic: z.boolean().default(true),
})

export const PhraseUpdateSchema = z.object({
  text: z.string().min(1).max(400).optional(),
  isPublic: z.boolean().optional(),
})

export const DailyNoteUpsertSchema = z.object({
  dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(80).optional().nullable(),
  content: z.string().max(1000).optional().nullable(),
  isPublic: z.boolean().default(true),
})

export type PhotoCreateInput = z.infer<typeof PhotoCreateSchema>
export type PhraseCreateInput = z.infer<typeof PhraseCreateSchema>
export type PhraseUpdateInput = z.infer<typeof PhraseUpdateSchema>
export type DailyNoteUpsertInput = z.infer<typeof DailyNoteUpsertSchema>
