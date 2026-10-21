export const ROLES = Object.freeze({ STUDENT: 'STUDENT', COMPANY: 'COMPANY', ADMIN: 'ADMIN' });
// Only these roles may be self-registered. ADMIN accounts are created via seed script / by another admin.
export const SELF_REGISTRABLE_ROLES = [ROLES.STUDENT, ROLES.COMPANY];

export const ACCOUNT_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED' });
export const VERIFICATION_STATUS = Object.freeze({ PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' });
export const JOB_STATUS = Object.freeze({ DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', CLOSED: 'CLOSED', WITHDRAWN: 'WITHDRAWN' });
export const JOB_TYPES = ['FULL_TIME', 'INTERNSHIP', 'INTERNSHIP_PPO'];
export const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  PLACED: 'PLACED',
  WITHDRAWN: 'WITHDRAWN',
  REJECTED: 'REJECTED',
});
export const OFFER_STATUS = Object.freeze({ PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', DECLINED: 'DECLINED' });
export const INTERVIEW_STATUS = Object.freeze({ SCHEDULED: 'SCHEDULED', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' });
export const INTERVIEW_MODES = ['ONLINE', 'ONSITE'];
export const NOTIFICATION_TYPES = ['GENERAL', 'COMPANY', 'JOB', 'APPLICATION', 'INTERVIEW', 'OFFER'];

// Allowed application status transitions (company/admin driven, plus student withdrawal/placement).
export const APPLICATION_TRANSITIONS = Object.freeze({
  APPLIED: ['SHORTLISTED', 'WITHDRAWN', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'WITHDRAWN', 'REJECTED'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: ['PLACED', 'REJECTED'],
  PLACED: [],
  WITHDRAWN: [],
  REJECTED: [],
});
