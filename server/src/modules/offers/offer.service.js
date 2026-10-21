import { Offer } from './offer.model.js';
import { Application } from '../applications/application.model.js';
import { User } from '../users/user.model.js';
import { getAuthorizedApplication } from '../applications/application.service.js';
import { requireCompanyForUser } from '../companies/company.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { APPLICATION_STATUS, OFFER_STATUS, ROLES } from '../../utils/constants.js';
import { notify } from '../notifications/notification.service.js';

const POPULATE = [
  { path: 'job', select: 'title location jobType' },
  { path: 'company', select: 'name' },
  { path: 'student', select: 'name email studentProfile.branch' },
];

export async function createOffer(user, data) {
  const application = await getAuthorizedApplication(user, data.applicationId);
  if (![APPLICATION_STATUS.INTERVIEW, APPLICATION_STATUS.SELECTED].includes(application.status)) {
    throw ApiError.conflict('Offers can only be made to candidates who reached the interview stage');
  }
  let offer;
  try {
    offer = await Offer.create({
      application: application._id,
      student: application.student,
      job: application.job._id,
      company: application.job.company._id,
      packageLPA: data.packageLPA,
      joiningDate: data.joiningDate,
      message: data.message,
    });
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict('An offer already exists for this application');
    throw err;
  }
  if (application.status !== APPLICATION_STATUS.SELECTED) {
    application.status = APPLICATION_STATUS.SELECTED;
    application.statusHistory.push({ status: APPLICATION_STATUS.SELECTED, changedBy: user._id, remarks: 'Offer created' });
    await application.save();
  }
  await notify(application.student, {
    type: 'OFFER',
    title: 'You have a new offer!',
    message: `${application.job.company.name} has offered you the ${application.job.title} role.`,
    link: '/student/offers',
  });
  return offer;
}

export async function listMine(user) {
  let filter = {};
  if (user.role === ROLES.STUDENT) {
    filter = { student: user._id };
  } else if (user.role === ROLES.COMPANY) {
    const company = await requireCompanyForUser(user._id);
    filter = { company: company._id };
  }
  return Offer.find(filter).populate(POPULATE).sort({ createdAt: -1 });
}

export async function respond(student, id, response) {
  // Scoped to the student: another student's offer id simply 404s.
  const offer = await Offer.findOne({ _id: id, student: student._id }).populate('company', 'user name').populate('job', 'title');
  if (!offer) throw ApiError.notFound('Offer not found');
  if (offer.status !== OFFER_STATUS.PENDING) throw ApiError.conflict(`This offer was already ${offer.status.toLowerCase()}`);

  offer.status = response;
  offer.respondedAt = new Date();
  await offer.save();

  const currentApp = await Application.findById(offer.application);

  if (response === OFFER_STATUS.ACCEPTED) {
    // 1. Mark accepted application as PLACED
    if (currentApp) {
      currentApp.status = APPLICATION_STATUS.PLACED;
      currentApp.statusHistory.push({
        status: APPLICATION_STATUS.PLACED,
        changedBy: student._id,
        remarks: `Offer accepted with ${offer.company.name} at ${offer.packageLPA} LPA`,
      });
      await currentApp.save();
    }

    // 2. Mark student as PLACED in profile
    await User.findByIdAndUpdate(student._id, {
      $set: { 'studentProfile.placementStatus': 'PLACED' },
    });

    // 3. Enforce Institutional One-Offer Policy (BR-06):
    // Auto-close any other ongoing applications for this student.
    const activeStatuses = [APPLICATION_STATUS.APPLIED, APPLICATION_STATUS.SHORTLISTED, APPLICATION_STATUS.INTERVIEW, APPLICATION_STATUS.SELECTED];
    const otherApps = await Application.find({
      student: student._id,
      _id: { $ne: offer.application },
      status: { $in: activeStatuses },
    });

    for (const app of otherApps) {
      app.status = APPLICATION_STATUS.REJECTED;
      app.statusHistory.push({
        status: APPLICATION_STATUS.REJECTED,
        changedBy: student._id,
        remarks: `Auto-closed (BR-06): student accepted an offer from ${offer.company.name}`,
      });
      await app.save();
    }

    // 4. Auto-decline any other pending offers
    await Offer.updateMany(
      { student: student._id, _id: { $ne: offer._id }, status: OFFER_STATUS.PENDING },
      { status: OFFER_STATUS.DECLINED, respondedAt: new Date() }
    );

    // 5. Congratulatory notification to the student
    await notify(student._id, {
      type: 'OFFER',
      title: 'Congratulations! You are Placed',
      message: `You accepted the offer from ${offer.company.name} for ${offer.job.title}. Your status is now PLACED.`,
      link: '/student/offers',
    });
  } else if (response === OFFER_STATUS.DECLINED && currentApp) {
    currentApp.status = APPLICATION_STATUS.REJECTED;
    currentApp.statusHistory.push({
      status: APPLICATION_STATUS.REJECTED,
      changedBy: student._id,
      remarks: `Offer declined by candidate`,
    });
    await currentApp.save();
  }

  await notify(offer.company.user, {
    type: 'OFFER',
    title: `Offer ${response.toLowerCase()}`,
    message: `${student.name} ${response.toLowerCase()} the ${offer.job.title} offer.`,
    link: '/company/applicants',
  });
  return offer;
}

