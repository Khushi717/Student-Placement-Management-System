import { startDb, stopDb, clearDb, api, auth, registerStudent, registerCompany, createAdmin, futureISO } from './helpers.js';

beforeAll(startDb, 120000);
afterAll(stopDb);
beforeEach(clearDb);

const jobBody = (over = {}) => ({
  title: 'Software Engineer', description: 'Build and ship features', deadline: futureISO(),
  packageLPA: 12, eligibility: { minCgpa: 7, eligibleBranches: ['CSE'], maxActiveBacklogs: 0 }, ...over,
});

// NOTE: createAdmin() uses a fixed email, so call it at most once per test.
async function approvedCompany() {
  const admin = await createAdmin();
  const company = await registerCompany();
  const me = await api().get('/api/auth/me').set(auth(company.token));
  const companyId = me.body.data.company._id;
  await api().patch(`/api/companies/${companyId}/verification`).set(auth(admin.token)).send({ status: 'APPROVED' }).expect(200);
  return { admin, company, companyId };
}

// admin + approved company + job + student who has applied
async function applicationSetup() {
  const { admin, company, companyId } = await approvedCompany();
  const job = (await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201)).body.data;
  const student = await registerStudent();
  const app = (await api().post('/api/applications').set(auth(student.token)).send({ jobId: job._id, resumeUrl: 'https://example.com/r.pdf' }).expect(201)).body.data;
  return { admin, company, companyId, student, job, app };
}

// ---------------------------------------------------------------- NOTIFICATIONS
describe('notifications', () => {
  test('N1: notifications need a token', async () => {
    await api().get('/api/notifications').expect(401);
  });

  test('N2: recruiter is notified when a student applies', async () => {
    const { company } = await applicationSetup();
    const res = await api().get('/api/notifications').set(auth(company.token)).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('N3: student is notified when shortlisted', async () => {
    const { company, student, app } = await applicationSetup();
    await api().patch(`/api/applications/${app._id}/status`).set(auth(company.token)).send({ status: 'SHORTLISTED' }).expect(200);
    const res = await api().get('/api/notifications').set(auth(student.token)).expect(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('N4: user can mark own notification as read', async () => {
    const { company } = await applicationSetup();
    const before = await api().get('/api/notifications').set(auth(company.token)).expect(200);
    const id = before.body.data[0]._id;
    await api().patch(`/api/notifications/${id}/read`).set(auth(company.token)).expect(200);
    const after = await api().get('/api/notifications').set(auth(company.token)).expect(200);
    expect(after.body.data.find((n) => n._id === id).isRead).toBe(true);
  });

  test('N5: user cannot mark someone else\'s notification as read', async () => {
    const { company, student } = await applicationSetup();
    const list = await api().get('/api/notifications').set(auth(company.token)).expect(200);
    const id = list.body.data[0]._id;
    const res = await api().patch(`/api/notifications/${id}/read`).set(auth(student.token));
    expect([403, 404]).toContain(res.status);
  });

  test('N6: read-all marks every notification as read', async () => {
    const { company } = await applicationSetup();
    await api().patch('/api/notifications/read-all').set(auth(company.token)).expect(200);
    const list = await api().get('/api/notifications').set(auth(company.token)).expect(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
    list.body.data.forEach((n) => expect(n.isRead).toBe(true));
  });

  test('N7: a user only sees their own notifications', async () => {
    const { student } = await applicationSetup();
    const res = await api().get('/api/notifications').set(auth(student.token)).expect(200);
    // student has done nothing that notifies them yet; the recruiter's "application received" must not leak
    expect(res.body.data).toHaveLength(0);
  });
});

// ---------------------------------------------------------------- REPORTS
describe('reports & analytics', () => {
  test('R1: reports need a token', async () => {
    await api().get('/api/reports/dashboard').expect(401);
  });

  test('R2: student cannot open the dashboard', async () => {
    const { token } = await registerStudent();
    await api().get('/api/reports/dashboard').set(auth(token)).expect(403); // ASSUMPTION: students are not allowed
  });

  test('R3: admin can open the dashboard', async () => {
    const admin = await createAdmin();
    const res = await api().get('/api/reports/dashboard').set(auth(admin.token)).expect(200);
    expect(res.body.success).toBe(true);
  });

  test('R4: placement report works after an accepted offer', async () => {
    const { admin, company, student, app } = await applicationSetup();
    await api().patch(`/api/applications/${app._id}/status`).set(auth(company.token)).send({ status: 'SHORTLISTED' }).expect(200);
    await api().post('/api/interviews').set(auth(company.token)).send({ applicationId: app._id, scheduledAt: futureISO(2), mode: 'ONLINE', location: 'https://meet.example.com/x' }).expect(201);
    const offer = (await api().post('/api/offers').set(auth(company.token)).send({ applicationId: app._id, packageLPA: 12 }).expect(201)).body.data;
    await api().patch(`/api/offers/${offer._id}/respond`).set(auth(student.token)).send({ response: 'ACCEPTED' }).expect(200);

    const res = await api().get('/api/reports/placements').set(auth(admin.token)).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('R5: report generation (PDF/Excel) is not implemented -> 501', async () => {
    const admin = await createAdmin();
    await api().post('/api/reports/generate').set(auth(admin.token)).send({}).expect(501); // README says 501; update if built
  });
});

// ---------------------------------------------------------------- FEEDBACK
// Body per feedback.validators.js: { companyId, jobId?, rating 1-5 (int), comments? }, .strict()
describe('feedback', () => {
  const fb = (companyId, over = {}) => ({ companyId, rating: 4, comments: 'Smooth process', ...over });

  test('F1: feedback needs a token', async () => {
    await api().post('/api/feedback').send({}).expect(401);
  });

  test('F2: a company cannot submit student feedback', async () => {
    const { company, companyId } = await applicationSetup();
    await api().post('/api/feedback').set(auth(company.token)).send(fb(companyId)).expect(403);
  });

  test('F3: student who never applied to that company is rejected', async () => {
    const { companyId } = await applicationSetup();
    const outsider = await registerStudent();
    const res = await api().post('/api/feedback').set(auth(outsider.token)).send(fb(companyId));
    expect([400, 403]).toContain(res.status);
  });

  test.each([0, 6, -1, 'abc', 3.5])('F4: invalid rating %p is rejected (valid: integer 1-5)', async (rating) => {
    const { student, companyId } = await applicationSetup();
    await api().post('/api/feedback').set(auth(student.token)).send(fb(companyId, { rating })).expect(400);
  });

  test('F5: student who applied can submit valid feedback', async () => {
    const { student, companyId } = await applicationSetup();
    await api().post('/api/feedback').set(auth(student.token)).send(fb(companyId)).expect(201);
  });

  test('F6: boundary ratings 1 and 5 are accepted', async () => {
    const { student, companyId } = await applicationSetup();
    await api().post('/api/feedback').set(auth(student.token)).send(fb(companyId, { rating: 1 })).expect(201);
    await api().post('/api/feedback').set(auth(student.token)).send(fb(companyId, { rating: 5 })).expect(201);
  });

  test('F7: unknown fields are rejected (strict schema)', async () => {
    const { student, companyId } = await applicationSetup();
    await api().post('/api/feedback').set(auth(student.token)).send({ ...fb(companyId), hacker: true }).expect(400);
  });

  test('F8: malformed companyId is rejected', async () => {
    const { student } = await applicationSetup();
    await api().post('/api/feedback').set(auth(student.token)).send(fb('not-an-id')).expect(400);
  });

  test('F9: comments longer than 2000 characters are rejected', async () => {
    const { student, companyId } = await applicationSetup();
    await api().post('/api/feedback').set(auth(student.token)).send(fb(companyId, { comments: 'x'.repeat(2001) })).expect(400);
  });
});
