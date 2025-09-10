import { z } from 'zod';

export const LeadQuerySchema = z.object({
  version: z.literal(1),
  vertical: z.enum(['dentist','law_firm','contractor','hvac','roofing','generic']),
  geo: z.object({
    city: z.string(),
    state: z.string().length(2),
    radius_km: z.number().int().positive().max(200).optional()
  }),
  constraints: z.object({
    must: z.array(z.record(z.union([z.boolean(), z.number(), z.string()]))).optional(),
    optional: z.array(z.record(z.union([z.boolean(), z.number(), z.string()]))).optional()
  }).optional(),
  exclusions: z.array(z.union([z.string(), z.record(z.any())])).optional(),
  result_size: z.object({ target: z.number().int().positive().max(500) }).optional(),
  sort_by: z.enum(['score_desc']).optional(),
  lead_profile: z.string().optional(),
  output: z.object({ contract: z.enum(['csv','json']) }).optional(),
  notify: z.object({ on_complete: z.boolean() }).optional(),
  compliance_flags: z.array(z.string()).optional()
});

export type LeadQuery = z.infer<typeof LeadQuerySchema>;

