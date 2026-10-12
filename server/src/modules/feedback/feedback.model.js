import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' }, // optional: feedback about a specific drive
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

feedbackSchema.index({ company: 1, createdAt: -1 });
feedbackSchema.index({ student: 1, createdAt: -1 });

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
