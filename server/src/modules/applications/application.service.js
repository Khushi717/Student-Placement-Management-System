import { Application } from './application.model.js';
import { JobPosting } from '../jobs/job.model.js';
import { checkEligibility } from '../jobs/eligibility.service.js';
import { requireCompanyForUser } from '../companies/company.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { APPLICATION_STATUS, APPLICATION_TRANSITIONS, ROLES } from '../../utils/constants.js';
import { getPagination, pageMeta } from '../../utils/pagination.js';
import { notify } from '../notifications/notification.service.js';

const JOB_POPULATE = { path: 'job', select: 'title company deadline packageLPA location jobType', populate: { path: 'company', select: 'name user' } };

export async function applyToJob(student, { jobId, resumeUrl, coverNote }) {
  const job = await JobPosting.findById(jobId).populate('company', 'name user');
  if (!job) throw ApiError.notFound('Job not found');

  const { eligible, reasons } = checkEligibility(student, job);
  if (!eligible) throw ApiError.badRequest('You are not eligible for this job', reasons.map((message) => ({ field: 'eligibility', message })));

  const resume = resumeUrl || student.studentProfile?.resumeUrl;
  if (!resume) throw ApiError.badRequest('Provide a resume link or save one in your profile');

  let application;
  try {
    application = await Application.create({
      job: job._id,
      student: student._id,
      resumeUrl: resume,
      coverNote,
      statusHistory: [{ status: APPLICATION_STATUS.APPLIED, changedBy: student._id }],
    });
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict('You have already applied to this job'); // unique {job, student} index
    throw err;
  }

  await notify(job.company.user, {
    type: 'APPLICATION',
    title: 'New application received',
    message: `${student.name} applied for ${job.title}.`,
    link: `/company/applicants?jobId=${job._id}`,
  });
  return application;
}

export async function listMine(student, query) {
  const pg = getPagination(query);
  const filter = { student: student._id };
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    Application.find(filter).populate(JOB_POPULATE).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    Application.countDocuments(filter),
  ]);
  return { items, meta: pageMeta(total, pg) };
}

/** Applicant list for companies (own jobs only) and admins (everything). */
export async function listApplicants(user, query) {
  const pg = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;

  if (user.role === ROLES.COMPANY) {
    const company = await requireCompanyForUser(user._id);
    const jobIds = await JobPosting.find({ company: company._id }).distinct('_id');
    if (query.jobId && !jobIds.some((id) => String(id) === query.jobId)) throw ApiError.forbidden();
    filter.job = query.jobId || { $in: jobIds };
  } else if (query.jobId) {
    filter.job = query.jobId;
  }

  const [items, total] = await Promise.all([
    Application.find(filter)
      .populate(JOB_POPULATE)
      .populate('student', 'name email phone studentProfile')
      .sort({ createdAt: -1 })
      .skip(pg.skip)
      .limit(pg.limit),
    Application.countDocuments(filter),
  ]);
  return { items, meta: pageMeta(total, pg) };
}

/** Loads an application and verifies the caller may see it (owner student, owning company, or admin). */
export async function getAuthorizedApplication(user, id, { populateStudent = false } = {}) {
  let q = Application.findById(id).populate(JOB_POPULATE);
  if (populateStudent) q = q.populate('student', 'name email phone studentProfile');
  const application = await q;
  if (!application) throw ApiError.notFound('Application not found');

  const studentId = String(application.student?._id ?? application.student);
  if (user.role === ROLES.STUDENT && studentId !== String(user._id)) throw ApiError.notFound('Application not found'); // do not reveal existence
  if (user.role === ROLES.COMPANY && String(application.job.company.user) !== String(user._id)) throw ApiError.forbidden();
  return application;
}

export async function updateStatus(user, id, { status, remarks }) {
  const application = await getAuthorizedApplication(user, id);
  const allowed = APPLICATION_TRANSITIONS[application.status] ?? [];
  if (!allowed.includes(status)) {
    throw ApiError.conflict(`Cannot move an application from ${application.status} to ${status}`);
  }
  application.status = status;
  application.statusHistory.push({ status, changedBy: user._id, remarks });
  await application.save();

  await notify(application.student, {
    type: 'APPLICATION',
    title: `Application ${status.toLowerCase()}`,
    message: `Your application for ${application.job.title} is now ${status}.`,
    link: '/student/applications',
  });
  return application;
}
