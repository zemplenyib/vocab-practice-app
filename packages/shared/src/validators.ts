import { z } from 'zod';

export const AddWordSchema = z.object({
  hungarian: z.string().min(1).max(200),
  german: z.string().min(1).max(200),
  gender: z.enum(['der', 'die', 'das']).nullable().optional(),
});

export type AddWordInput = z.infer<typeof AddWordSchema>;

export const SubmitAnswerSchema = z.object({
  wordId: z.number().int().positive(),
  german: z.string().min(0).max(200),
  gender: z.enum(['der', 'die', 'das']).nullable().optional(),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

export const ListNameSchema = z.object({
  name: z.string().min(1).max(100).transform(s => s.trim()),
});
export type ListNameInput = z.infer<typeof ListNameSchema>;

export const ListIdQuerySchema = z.object({
  listId: z.coerce.number().int().positive().optional(),
});
export type ListIdQuery = z.infer<typeof ListIdQuerySchema>;
