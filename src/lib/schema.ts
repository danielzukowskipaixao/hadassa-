import { z } from "zod";

export const DayMessageSchema = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: z.string().trim().min(1).max(1500),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DayMessage = z.infer<typeof DayMessageSchema>;

export const ImportPayloadSchema = z.array(DayMessageSchema);
export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
