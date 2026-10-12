import { Feedback } from './feedback.model.js';
import { Application } from '../applications/application.model.js';
import { JobPosting } from '../jobs/job.model.js';
import { Company } from '../companies/company.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';

export async function createFeedback(student, { companyId, jobId, rating, comments }) {
  const company = await Company.findById(companyId);
  if (!company) throw ApiError.notFound('Company not found');

  // Only students who actually applied to this company may review it.
  const jobIds = await JobPosting.find({ company: companyId }).distinct('_id');
  const participated = await Application.exists({ student: student._id, job: { $in: jobIds } });
  if (!participated) throw ApiError.forbidden('You can only give feedback for companies you applied to');
  if (jobId && !jobIds.some((id) => String(id) === jobId)) throw ApiError.badRequest('That job does not belong to this company');

  return Feedback.create({ student: student._id, company: companyId, job: jobId, rating, comments });
}

/** Admins see all feedback; students only their own. */
export async function listFeedback(user) {
  const filter = user.role === ROLES.ADMIN ? {} : { student: user._id };
  return Feedback.find(filter)
    .populate('company', 'name')
    .populate('job', 'title')
    .populate('student', 'name studentProfile.branch')
    .sort({ createdAt: -1 })
    .limit(200);
}
