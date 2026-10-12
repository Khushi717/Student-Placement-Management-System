import mongoose from 'mongoose';
import { ROLES, ACCOUNT_STATUS } from '../../utils/constants.js';

// Student academic data lives in an embedded sub-document instead of a separate UserProfile
// collection: it is always read together with the user and only students have it.
const studentProfileSchema = new mongoose.Schema(
  {
    enrollmentNo: { type: String, trim: true },
    branch: { type: String, trim: true, uppercase: true },
    cgpa: { type: Number, min: 0, max: 10 },
    activeBacklogs: { type: Number, min: 0, default: 0 },
    graduationYear: { type: Number, min: 2000, max: 2100 },
    resumeUrl: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true, index: true },
    status: { type: String, enum: Object.values(ACCOUNT_STATUS), default: ACCOUNT_STATUS.ACTIVE },
    phone: { type: String, trim: true },
    studentProfile: { type: studentProfileSchema, default: undefined },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Enrollment numbers are unique only when present (partial index) so non-students are unaffected.
userSchema.index(
  { 'studentProfile.enrollmentNo': 1 },
  { unique: true, partialFilterExpression: { 'studentProfile.enrollmentNo': { $type: 'string' } } }
);
userSchema.index({ 'studentProfile.branch': 1 });

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
