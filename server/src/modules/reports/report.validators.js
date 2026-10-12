import { z } from 'zod';

export const placementsQuerySchema = z.object({ year: z.coerce.number().int().min(2000).max(2100).optional() });
export const generateReportSchema = z.object({ format: z.enum(['pdf', 'xlsx', 'csv']).default('pdf') });
