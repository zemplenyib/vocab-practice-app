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
