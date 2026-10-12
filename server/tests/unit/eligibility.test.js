import '../setup.js';
import { checkEligibility } from '../../src/modules/jobs/eligibility.service.js';

const future = new Date(Date.now() + 86400000);
const past = new Date(Date.now() - 86400000);
const job = (over = {}) => ({
  status: 'PUBLISHED',
  deadline: future,
  eligibility: { minCgpa: 7, eligibleBranches: ['CSE', 'IT'], maxActiveBacklogs: 0 },
  ...over,
});
const student = (p = {}) => ({ studentProfile: { cgpa: 8, branch: 'cse', activeBacklogs: 0, ...p } });

describe('checkEligibility', () => {
  test('eligible student passes', () => expect(checkEligibility(student(), job())).toEqual({ eligible: true, reasons: [] }));
  test('rejects low CGPA', () => {
    const r = checkEligibility(student({ cgpa: 6.5 }), job());
    expect(r.eligible).toBe(false);
    expect(r.reasons[0]).toMatch(/CGPA/);
  });
  test('rejects wrong branch (case-insensitive match otherwise)', () => {
    expect(checkEligibility(student({ branch: 'ece' }), job()).eligible).toBe(false);
    expect(checkEligibility(student({ branch: 'It' }), job()).eligible).toBe(true);
  });
  test('rejects too many active backlogs', () => expect(checkEligibility(student({ activeBacklogs: 1 }), job()).eligible).toBe(false));
  test('rejects after deadline', () => expect(checkEligibility(student(), job({ deadline: past })).eligible).toBe(false));
  test('rejects non-published jobs', () => expect(checkEligibility(student(), job({ status: 'CLOSED' })).eligible).toBe(false));
  test('empty branch list means all branches', () =>
    expect(checkEligibility(student({ branch: 'ME' }), job({ eligibility: { minCgpa: 0, eligibleBranches: [], maxActiveBacklogs: 5 } })).eligible).toBe(true));
  test('asks for CGPA when profile is incomplete', () => {
    const r = checkEligibility({ studentProfile: {} }, job());
    expect(r.eligible).toBe(false);
  });
});
