import { LeadQuerySchema } from './leadquery.js';
import { z } from 'zod';

export const ParsePromptRequestSchema = z.object({
  prompt: z.string()
});

export const ParsePromptResponseSchema = z.object({
  dsl: LeadQuerySchema,
  warnings: z.array(z.string())
});

export type ParsePromptRequest = z.infer<typeof ParsePromptRequestSchema>;
export type ParsePromptResponse = z.infer<typeof ParsePromptResponseSchema>;

