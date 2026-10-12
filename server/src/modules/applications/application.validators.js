import { z } from 'zod';
import { APPLICATION_STATUS } from '../../utils/constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createApplicationSchema = z
  .object({
    jobId: objectId,
    resumeUrl: z.string().trim().url().max(500).optional(),
    coverNote: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(APPLICATION_STATUS).refine((s) => s !== 'APPLIED', 'Cannot move back to APPLIED'),
  remarks: z.string().trim().max(500).optional(),
});

export const listApplicationsQuerySchema = z.object({
  jobId: objectId.optional(),
  status: z.nativeEnum(APPLICATION_STATUS).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
