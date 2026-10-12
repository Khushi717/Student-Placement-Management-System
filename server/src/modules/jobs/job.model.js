import mongoose from 'mongoose';
import { JOB_STATUS, JOB_TYPES } from '../../utils/constants.js';

// Eligibility rules are embedded: they have no life outside their job posting.
const eligibilitySchema = new mongoose.Schema(
  {
    minCgpa: { type: Number, min: 0, max: 10, default: 0 },
    eligibleBranches: [{ type: String, trim: true, uppercase: true }], // empty array = all branches
    maxActiveBacklogs: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const jobPostingSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    location: { type: String, trim: true, maxlength: 150 },
    jobType: { type: String, enum: JOB_TYPES, default: 'FULL_TIME' },
    packageLPA: { type: Number, min: 0 }, // CTC in lakhs per annum (or monthly stipend for internships)
    skills: [{ type: String, trim: true }],
    openings: { type: Number, min: 1, default: 1 },
    deadline: { type: Date, required: true },
    status: { type: String, enum: Object.values(JOB_STATUS), default: JOB_STATUS.DRAFT },
    eligibility: { type: eligibilitySchema, default: () => ({}) },
    publishedAt: Date,
  },
  { timestamps: true }
);

jobPostingSchema.index({ company: 1, status: 1 });
jobPostingSchema.index({ status: 1, deadline: 1 });

export const JobPosting = mongoose.models.JobPosting || mongoose.model('JobPosting', jobPostingSchema);
