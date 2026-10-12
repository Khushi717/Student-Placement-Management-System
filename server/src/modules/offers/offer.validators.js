import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createOfferSchema = z
  .object({
    applicationId: objectId,
    packageLPA: z.coerce.number().min(0).max(1000),
    joiningDate: z.coerce.date().optional(),
    message: z.string().trim().max(1000).optional(),
  })
  .strict();

export const respondOfferSchema = z.object({ response: z.enum(['ACCEPTED', 'DECLINED']) });
