import { z } from 'zod';
import { ACCOUNT_STATUS, ROLES } from '../../utils/constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const studentProfileFields = {
  enrollmentNo: z.string().trim().min(3).max(30).optional(),
  branch: z.string().trim().min(2).max(30).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  activeBacklogs: z.coerce.number().int().min(0).max(50).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
  resumeUrl: z.string().trim().url().max(500).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
};

// Role / status / email are deliberately NOT editable here.
export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    studentProfile: z.object(studentProfileFields).partial().optional(),
  })
  .strict();

export const idParamSchema = z.object({ id: objectId });

export const listUsersQuerySchema = z.object({
  role: z.nativeEnum(ROLES).optional(),
  status: z.nativeEnum(ACCOUNT_STATUS).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const updateUserStatusSchema = z.object({ status: z.nativeEnum(ACCOUNT_STATUS) });
