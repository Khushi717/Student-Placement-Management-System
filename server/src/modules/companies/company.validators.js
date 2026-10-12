import { z } from 'zod';
import { VERIFICATION_STATUS } from '../../utils/constants.js';

export const companyFields = {
  name: z.string().trim().min(2).max(150),
  industry: z.string().trim().max(100).optional(),
  website: z.string().trim().url().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(150).optional(),
  hrContactName: z.string().trim().max(100).optional(),
  hrContactEmail: z.string().trim().email().optional(),
  hrContactPhone: z.string().trim().min(7).max(20).optional(),
};

export const updateCompanySchema = z.object(companyFields).partial().strict();

export const verifyCompanySchema = z.object({
  status: z.enum([VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED]),
  remarks: z.string().trim().max(500).optional(),
});

export const listCompaniesQuerySchema = z.object({
  verificationStatus: z.nativeEnum(VERIFICATION_STATUS).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
