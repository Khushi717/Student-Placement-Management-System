import { InterviewSchedule } from './interview.model.js';
import { Application } from '../applications/application.model.js';
import { JobPosting } from '../jobs/job.model.js';
import { getAuthorizedApplication } from '../applications/application.service.js';
import { requireCompanyForUser } from '../companies/company.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { APPLICATION_STATUS, ROLES } from '../../utils/constants.js';
import { notify } from '../notifications/notification.service.js';

const POPULATE = {
  path: 'application',
  select: 'job student status',
  populate: [
    { path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } },
    { path: 'student', select: 'name email' },
  ],
};

export async function scheduleInterview(user, data) {
  const application = await getAuthorizedApplication(user, data.applicationId); // ownership check included
  if (![APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.INTERVIEW].includes(application.status)) {
    throw ApiError.conflict('Only shortlisted candidates can be scheduled for an interview');
  }
  const { applicationId, ...fields } = data;
  const interview = await InterviewSchedule.create({ ...fields, application: application._id, scheduledBy: user._id });

  if (application.status !== APPLICATION_STATUS.INTERVIEW) {
    application.status = APPLICATION_STATUS.INTERVIEW;
    application.statusHistory.push({ status: APPLICATION_STATUS.INTERVIEW, changedBy: user._id, remarks: `Interview scheduled (${interview.round})` });
    await application.save();
  }
  await notify(application.student, {
    type: 'INTERVIEW',
    title: 'Interview scheduled',
    message: `${application.job.title}: ${interview.round} on ${interview.scheduledAt.toLocaleString()}.`,
    link: '/student/interviews',
  });
  return interview;
}

/** Students: their own interviews. Companies: interviews for their jobs. Admins: all. */
export async function listMine(user) {
  let filter = {};
  if (user.role === ROLES.STUDENT) {
    const appIds = await Application.find({ student: user._id }).distinct('_id');
    filter = { application: { $in: appIds } };
  } else if (user.role === ROLES.COMPANY) {
    const company = await requireCompanyForUser(user._id);
    const jobIds = await JobPosting.find({ company: company._id }).distinct('_id');
    const appIds = await Application.find({ job: { $in: jobIds } }).distinct('_id');
    filter = { application: { $in: appIds } };
  }
  return InterviewSchedule.find(filter).populate(POPULATE).sort({ scheduledAt: 1 });
}

export async function updateInterview(user, id, updates) {
  const interview = await InterviewSchedule.findById(id);
  if (!interview) throw ApiError.notFound('Interview not found');
  await getAuthorizedApplication(user, interview.application); // throws unless company-owner/admin (students are blocked by the route)
  Object.assign(interview, updates);
  await interview.save();
  return interview;
}
