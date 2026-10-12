import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../../utils/constants.js';

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(APPLICATION_STATUS), required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, trim: true, maxlength: 500 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(APPLICATION_STATUS), default: APPLICATION_STATUS.APPLIED },
    // Resume upload integration point: today a link (e.g. Drive/GitHub); later a file-storage URL.
    resumeUrl: { type: String, trim: true, maxlength: 500 },
    coverNote: { type: String, trim: true, maxlength: 1000 },
    statusHistory: [historySchema],
  },
  { timestamps: true }
);

// Core business rule: a student can apply to a given job only once (enforced by the database, not just code).
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
