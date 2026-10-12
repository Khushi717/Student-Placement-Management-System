import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createFeedbackSchema = z
  .object({
    companyId: objectId,
    jobId: objectId.optional(),
    rating: z.coerce.number().int().min(1).max(5),
    comments: z.string().trim().max(2000).optional(),
  })
  .strict();
