import mongoose from 'mongoose';
import { OFFER_STATUS } from '../../utils/constants.js';

const offerSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true }, // one offer per application
    // Denormalised for fast student/company/report queries (set once at creation, never edited).
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    packageLPA: { type: Number, required: true, min: 0 },
    joiningDate: Date,
    message: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: Object.values(OFFER_STATUS), default: OFFER_STATUS.PENDING },
    respondedAt: Date,
    // Extension point: offerLetterUrl (PDF generation is intentionally out of scope for the foundation phase)
  },
  { timestamps: true }
);

offerSchema.index({ student: 1, status: 1 });
offerSchema.index({ company: 1, status: 1 });

export const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
