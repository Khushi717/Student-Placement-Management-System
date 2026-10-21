// Pure functions (no DB access) so the rules are trivial to unit-test and reuse from other modules.
import { JOB_STATUS } from '../../utils/constants.js';

const up = (s) => String(s ?? '').trim().toUpperCase();

/**
 * Checks one student against one job.
 * @returns {{ eligible: boolean, reasons: string[] }} reasons are human-readable and safe to show to the student.
 */
export function checkEligibility(student, job, now = new Date()) {
  const reasons = [];
  const profile = student?.studentProfile ?? {};
  const rules = job.eligibility ?? {};

  if (job.status !== JOB_STATUS.PUBLISHED) reasons.push('This job is not open for applications');
  if (job.deadline && new Date(job.deadline) < now) reasons.push('The application deadline has passed');

  if (profile.placementStatus === 'PLACED') {
    reasons.push('You are already placed and cannot apply to further drives per institutional policy');
  }

  if (rules.minCgpa > 0) {
    if (profile.cgpa == null) reasons.push('Add your CGPA to your profile to check eligibility');
    else if (profile.cgpa < rules.minCgpa) reasons.push(`Minimum CGPA of ${rules.minCgpa} required (yours: ${profile.cgpa})`);
  }

  if (rules.eligibleBranches?.length) {
    const allowed = rules.eligibleBranches.map(up);
    if (!profile.branch) reasons.push('Add your branch to your profile to check eligibility');
    else if (!allowed.includes(up(profile.branch))) reasons.push(`Open to ${allowed.join(', ')} only`);
  }

  if (rules.maxActiveBacklogs != null && (profile.activeBacklogs ?? 0) > rules.maxActiveBacklogs) {
    reasons.push(`At most ${rules.maxActiveBacklogs} active backlog(s) allowed (yours: ${profile.activeBacklogs})`);
  }

  return { eligible: reasons.length === 0, reasons };
}
