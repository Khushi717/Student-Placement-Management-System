import mongoose from 'mongoose';
import { VERIFICATION_STATUS } from '../../utils/constants.js';

const companySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // one company per recruiter account
    name: { type: String, required: true, trim: true, maxlength: 150 },
    industry: { type: String, trim: true, maxlength: 100 },
    website: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 150 },
    hrContactName: { type: String, trim: true, maxlength: 100 },
    hrContactEmail: { type: String, trim: true, lowercase: true },
    hrContactPhone: { type: String, trim: true },
    verificationStatus: { type: String, enum: Object.values(VERIFICATION_STATUS), default: VERIFICATION_STATUS.PENDING },
    verificationRemarks: { type: String, trim: true, maxlength: 500 },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
  },
  { timestamps: true }
);

companySchema.index({ verificationStatus: 1, createdAt: -1 });
companySchema.index({ name: 1 });

export const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
