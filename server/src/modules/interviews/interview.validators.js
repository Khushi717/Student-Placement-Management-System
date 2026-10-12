import { z } from 'zod';
import { INTERVIEW_MODES, INTERVIEW_STATUS } from '../../utils/constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createInterviewSchema = z
  .object({
    applicationId: objectId,
    round: z.string().trim().max(60).optional(),
    scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), 'Interview must be scheduled in the future'),
    durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
    mode: z.enum(INTERVIEW_MODES).default('ONLINE'),
    location: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updateInterviewSchema = z
  .object({
    status: z.nativeEnum(INTERVIEW_STATUS).optional(),
    outcomeNotes: z.string().trim().max(1000).optional(),
  })
  .strict();
