import '../setup.js';
import { registerSchema } from '../../src/modules/auth/auth.validators.js';
import { createJobSchema } from '../../src/modules/jobs/job.validators.js';

const stu = { name: 'Asha', email: 'ASHA@x.com', password: 'Passw0rd1', role: 'STUDENT', studentProfile: { enrollmentNo: '2024001', branch: 'cse' } };

describe('registerSchema', () => {
  test('accepts a student and lowercases the email', () => expect(registerSchema.parse(stu).email).toBe('asha@x.com'));
  test('never accepts ADMIN as a role', () => expect(registerSchema.safeParse({ ...stu, role: 'ADMIN' }).success).toBe(false));
  test('rejects weak passwords', () => expect(registerSchema.safeParse({ ...stu, password: 'password' }).success).toBe(false));
  test('rejects unknown fields (e.g. status) on the student profile', () =>
    expect(registerSchema.safeParse({ ...stu, studentProfile: { ...stu.studentProfile, isPlaced: true } }).success).toBe(false));
});

describe('createJobSchema', () => {
  const base = { title: 'SDE', description: 'Build things well', deadline: new Date(Date.now() + 86400000).toISOString() };
  test('applies defaults', () => expect(createJobSchema.parse(base).eligibility).toEqual({ minCgpa: 0, eligibleBranches: [], maxActiveBacklogs: 0 }));
  test('rejects past deadlines', () => expect(createJobSchema.safeParse({ ...base, deadline: '2020-01-01' }).success).toBe(false));
});
