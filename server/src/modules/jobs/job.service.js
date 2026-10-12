import { JobPosting } from './job.model.js';
import { Application } from '../applications/application.model.js';
import { checkEligibility } from './eligibility.service.js';
import { requireApprovedCompanyForUser, requireCompanyForUser } from '../companies/company.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { JOB_STATUS, ROLES } from '../../utils/constants.js';
import { getPagination, pageMeta } from '../../utils/pagination.js';
import { User } from '../users/user.model.js';
import { notify } from '../notifications/notification.service.js';

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function createJob(user, data) {
  const company = await requireApprovedCompanyForUser(user._id); // only APPROVED companies can post
  const { publish, ...fields } = data;
  const job = await JobPosting.create({
    ...fields,
    company: company._id,
    postedBy: user._id,
    status: publish ? JOB_STATUS.PUBLISHED : JOB_STATUS.DRAFT,
    publishedAt: publish ? new Date() : undefined,
  });
  if (publish) await notifyStudentsOfNewJob(job, company);
  return job.populate('company', 'name industry location');
}

// Notify only students who currently meet the eligibility criteria.
async function notifyStudentsOfNewJob(job, company) {
  const students = await User.find({ role: ROLES.STUDENT, status: 'ACTIVE' }).select('studentProfile');
  const eligible = students.filter((s) => checkEligibility(s, job).eligible);
  await Promise.all(
    eligible.map((s) =>
      notify(s._id, {
        type: 'JOB',
        title: `New drive: ${job.title}`,
        message: `${company.name} is hiring. Apply before ${job.deadline.toDateString()}.`,
        link: `/student/jobs/${job._id}`,
      })
    )
  );
}

export async function listJobs(user, query) {
  const pg = getPagination(query);
  const filter = {};

  if (user.role === ROLES.COMPANY) {
    const company = await requireCompanyForUser(user._id);
    filter.company = company._id;
    if (query.status) filter.status = query.status;
  } else if (user.role === ROLES.STUDENT) {
    filter.status = JOB_STATUS.PUBLISHED; // students never see drafts/closed/withdrawn
    filter.deadline = { $gte: new Date() };
  } else {
    if (query.status) filter.status = query.status;
    if (query.company) filter.company = query.company;
  }
  if (query.jobType) filter.jobType = query.jobType;
  if (query.search) filter.title = new RegExp(escapeRx(query.search), 'i');

  if (user.role === ROLES.STUDENT) {
    // Eligibility is evaluated in JS (small dataset, rules live in one place). Paginate afterwards.
    const all = await JobPosting.find(filter).populate('company', 'name industry location').sort({ deadline: 1 });
    let rows = all.map((j) => ({ ...j.toJSON(), eligibilityCheck: checkEligibility(user, j) }));
    if (query.eligible === 'true') rows = rows.filter((r) => r.eligibilityCheck.eligible);
    if (query.eligible === 'false') rows = rows.filter((r) => !r.eligibilityCheck.eligible);
    return { items: rows.slice(pg.skip, pg.skip + pg.limit), meta: pageMeta(rows.length, pg) };
  }

  const [items, total] = await Promise.all([
    JobPosting.find(filter).populate('company', 'name industry location').sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    JobPosting.countDocuments(filter),
  ]);
  return { items, meta: pageMeta(total, pg) };
}

/** Loads a job and enforces visibility: students see published jobs only, companies only their own. */
export async function getJob(user, id) {
  const job = await JobPosting.findById(id).populate('company', 'name industry location website description user');
  if (!job) throw ApiError.notFound('Job not found');

  if (user.role === ROLES.COMPANY && String(job.company.user) !== String(user._id)) throw ApiError.forbidden();
  if (user.role === ROLES.STUDENT) {
    if (job.status !== JOB_STATUS.PUBLISHED) throw ApiError.notFound('Job not found');
    const applied = await Application.exists({ job: job._id, student: user._id });
    return { ...job.toJSON(), eligibilityCheck: checkEligibility(user, job), hasApplied: Boolean(applied) };
  }
  return job;
}

async function loadOwnedJob(user, id) {
  const job = await JobPosting.findById(id).populate('company', 'user');
  if (!job) throw ApiError.notFound('Job not found');
  if (user.role === ROLES.COMPANY && String(job.company.user) !== String(user._id)) throw ApiError.forbidden();
  return job;
}

export async function updateJob(user, id, updates) {
  const job = await loadOwnedJob(user, id);
  if ([JOB_STATUS.CLOSED, JOB_STATUS.WITHDRAWN].includes(job.status)) {
    throw ApiError.conflict(`A ${job.status.toLowerCase()} job can no longer be edited`);
  }
  const { eligibility, ...rest } = updates;
  Object.assign(job, rest);
  if (eligibility) job.eligibility = { ...job.eligibility.toObject(), ...eligibility };
  await job.save();
  return job;
}

const STATUS_RULES = {
  DRAFT: [], // cannot go back to draft
  PUBLISHED: ['CLOSED', 'WITHDRAWN'],
};
export async function setJobStatus(user, id, status) {
  const job = await loadOwnedJob(user, id);
  const allowedNext = job.status === JOB_STATUS.DRAFT ? ['PUBLISHED', 'WITHDRAWN'] : STATUS_RULES[job.status] ?? [];
  if (!allowedNext.includes(status)) throw ApiError.conflict(`Cannot change job from ${job.status} to ${status}`);

  if (status === JOB_STATUS.PUBLISHED) {
    const company = await requireApprovedCompanyForUser(job.postedBy);
    if (job.deadline < new Date()) throw ApiError.badRequest('Update the deadline before publishing');
    job.publishedAt = new Date();
    job.status = status;
    await job.save();
    await notifyStudentsOfNewJob(job, company);
    return job;
  }
  job.status = status;
  await job.save();
  return job;
}

export async function deleteJob(user, id) {
  const job = await loadOwnedJob(user, id);
  const applications = await Application.countDocuments({ job: job._id });
  if (applications > 0) {
    throw ApiError.conflict('This job already has applications and cannot be deleted. Withdraw it instead.');
  }
  await job.deleteOne();
}
