import { z } from 'zod';
import { JOB_STATUS, JOB_TYPES } from '../../utils/constants.js';

const eligibilitySchema = z
  .object({
    minCgpa: z.coerce.number().min(0).max(10).default(0),
    eligibleBranches: z.array(z.string().trim().min(2).max(30)).max(20).default([]),
    maxActiveBacklogs: z.coerce.number().int().min(0).max(20).default(0),
  })
  .strict();

const futureDate = z.coerce.date().refine((d) => d.getTime() > Date.now(), 'Deadline must be in the future');

export const createJobSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(10).max(5000),
    location: z.string().trim().max(150).optional(),
    jobType: z.enum(JOB_TYPES).default('FULL_TIME'),
    packageLPA: z.coerce.number().min(0).max(1000).optional(),
    skills: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
    openings: z.coerce.number().int().min(1).max(10000).default(1),
    deadline: futureDate,
    eligibility: eligibilitySchema.default({}),
    publish: z.boolean().default(true), // false => save as DRAFT
  })
  .strict();

export const updateJobSchema = createJobSchema
  .omit({ publish: true })
  .partial()
  .extend({ eligibility: eligibilitySchema.partial().optional() })
  .strict();

export const jobStatusSchema = z.object({ status: z.nativeEnum(JOB_STATUS) });

export const listJobsQuerySchema = z.object({
  status: z.nativeEnum(JOB_STATUS).optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  search: z.string().trim().max(100).optional(),
  eligible: z.enum(['true', 'false']).optional(), // students only
  company: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
