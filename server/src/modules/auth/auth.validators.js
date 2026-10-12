import { z } from 'zod';
import { SELF_REGISTRABLE_ROLES } from '../../utils/constants.js';
import { companyFields } from '../companies/company.validators.js';
import { studentProfileFields } from '../users/user.validators.js';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters') // bcrypt ignores bytes beyond 72
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

const base = {
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password,
  phone: z.string().trim().min(7).max(20).optional(),
};

// Discriminated on `role`. ADMIN is not an accepted value, so it can never be self-assigned.
export const registerSchema = z.discriminatedUnion('role', [
  z.object({
    ...base,
    role: z.literal('STUDENT'),
    studentProfile: z
      .object({
        enrollmentNo: studentProfileFields.enrollmentNo.unwrap(),
        branch: studentProfileFields.branch.unwrap(),
        cgpa: studentProfileFields.cgpa,
        activeBacklogs: studentProfileFields.activeBacklogs,
        graduationYear: studentProfileFields.graduationYear,
      })
      .strict(),
  }),
  z.object({
    ...base,
    role: z.literal('COMPANY'),
    company: z.object({ ...companyFields }).strict(),
  }),
]);

// Keep the allowed list in sync with the discriminated union (guards against future drift).
export const _selfRegistrable = SELF_REGISTRABLE_ROLES;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const resetPasswordSchema = z.object({ token: z.string().min(20), password });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: password });
