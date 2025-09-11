import { z } from 'zod';

export const LeadQuerySchema = z.object({
  version: z.literal(1).default(1),
  vertical: z.enum(['dentist','law_firm','contractor','hvac','roofing','generic']).default('generic'),
  geo: z.object({
    city: z.string(),
    state: z.string().length(2),
    radius_km: z.number().int().positive().max(200).optional().default(10)
  }),
  constraints: z.object({
    must: z.array(z.record(z.union([z.boolean(), z.number(), z.string()]))).optional().default([]),
    optional: z.array(z.record(z.union([z.boolean(), z.number(), z.string()]))).optional().default([])
  }).optional().default({ must: [], optional: [] }),
  exclusions: z.array(z.union([z.string(), z.record(z.any())])).optional().default([]),
  result_size: z.object({ target: z.number().int().positive().max(500).default(50) }).optional().default({ target: 50 }),
  sort_by: z.enum(['score_desc']).optional().default('score_desc'),
  lead_profile: z.string().default('ai_services_buyer'),
  output: z.object({ contract: z.enum(['csv','json']).default('csv') }).optional().default({ contract: 'csv' }),
  notify: z.object({ on_complete: z.boolean().default(false) }).optional().default({ on_complete: false }),
  compliance_flags: z.array(z.string()).optional().default([])
});

export type LeadQuery = z.infer<typeof LeadQuerySchema>;

