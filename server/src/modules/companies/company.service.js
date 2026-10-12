import { Company } from './company.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES, VERIFICATION_STATUS } from '../../utils/constants.js';
import { getPagination, pageMeta } from '../../utils/pagination.js';
import { notify } from '../notifications/notification.service.js';

export async function createCompanyForUser(userId, data) {
  return Company.create({ ...data, user: userId, verificationStatus: VERIFICATION_STATUS.PENDING });
}

export async function findCompanyByUser(userId) {
  return Company.findOne({ user: userId });
}

/** Returns the caller's company or throws. Used by job/applicant code to enforce ownership. */
export async function requireCompanyForUser(userId) {
  const company = await findCompanyByUser(userId);
  if (!company) throw ApiError.notFound('Company profile not found for this account');
  return company;
}

export async function requireApprovedCompanyForUser(userId) {
  const company = await requireCompanyForUser(userId);
  if (company.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    throw ApiError.forbidden('Your company must be approved by the placement cell before it can publish jobs');
  }
  return company;
}

export async function listCompanies(actor, query) {
  const pg = getPagination(query);
  const filter = {};
  if (actor.role === ROLES.STUDENT) {
    filter.verificationStatus = VERIFICATION_STATUS.APPROVED; // students only see verified companies
  } else if (actor.role === ROLES.COMPANY) {
    filter.user = actor._id; // recruiters only see their own record
  } else if (query.verificationStatus) {
    filter.verificationStatus = query.verificationStatus;
  }
  if (query.search) {
    filter.name = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  const [items, total] = await Promise.all([
    Company.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    Company.countDocuments(filter),
  ]);
  return { items, meta: pageMeta(total, pg) };
}

export async function getCompany(actor, id) {
  const company = await Company.findById(id).populate('user', 'name email');
  if (!company) throw ApiError.notFound('Company not found');
  const isOwner = String(company.user._id) === String(actor._id);
  if (actor.role === ROLES.COMPANY && !isOwner) throw ApiError.forbidden();
  if (actor.role === ROLES.STUDENT && company.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    throw ApiError.notFound('Company not found');
  }
  return company;
}

export async function updateCompany(actor, id, updates) {
  const company = await Company.findById(id);
  if (!company) throw ApiError.notFound('Company not found');
  if (actor.role === ROLES.COMPANY && String(company.user) !== String(actor._id)) throw ApiError.forbidden();
  Object.assign(company, updates);
  await company.save();
  return company;
}

export async function setVerification(admin, id, { status, remarks }) {
  const company = await Company.findById(id);
  if (!company) throw ApiError.notFound('Company not found');
  company.verificationStatus = status;
  company.verificationRemarks = remarks;
  company.verifiedBy = admin._id;
  company.verifiedAt = new Date();
  await company.save();

  const approved = status === VERIFICATION_STATUS.APPROVED;
  await notify(company.user, {
    type: 'COMPANY',
    title: approved ? 'Company approved' : 'Company registration rejected',
    message: approved
      ? 'Your company has been verified. You can now publish job postings.'
      : `Your company registration was rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
    link: '/company/profile',
  });
  return company;
}

// Used by the auth module when a recruiter registers; kept here so User/Company stay in sync.
export async function deleteCompanyByUser(userId) {
  await Company.deleteOne({ user: userId });
}
export async function countPendingCompanies() {
  return Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING });
}
