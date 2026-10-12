import mongoose from 'mongoose';
import { INTERVIEW_MODES, INTERVIEW_STATUS } from '../../utils/constants.js';

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    round: { type: String, trim: true, default: 'Round 1', maxlength: 60 },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, min: 5, max: 480, default: 45 },
    mode: { type: String, enum: INTERVIEW_MODES, default: 'ONLINE' },
    location: { type: String, trim: true, maxlength: 200 }, // venue or meeting link
    notes: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: Object.values(INTERVIEW_STATUS), default: INTERVIEW_STATUS.SCHEDULED },
    outcomeNotes: { type: String, trim: true, maxlength: 1000 }, // "record interview details" after it happens
  },
  { timestamps: true }
);

interviewSchema.index({ application: 1, scheduledAt: 1 });

export const InterviewSchedule = mongoose.models.InterviewSchedule || mongoose.model('InterviewSchedule', interviewSchema);
