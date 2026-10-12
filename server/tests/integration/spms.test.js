import { startDb, stopDb, clearDb, api, auth, registerStudent, registerCompany, createAdmin, futureISO } from './helpers.js';

beforeAll(startDb, 120000);
afterAll(stopDb);
beforeEach(clearDb);

const jobBody = (over = {}) => ({
  title: 'Software Engineer', description: 'Build and ship features', deadline: futureISO(),
  packageLPA: 12, eligibility: { minCgpa: 7, eligibleBranches: ['CSE'], maxActiveBacklogs: 0 }, ...over,
});

async function approvedCompany() {
  const admin = await createAdmin();
  const company = await registerCompany();
  const me = await api().get('/api/auth/me').set(auth(company.token));
  await api().patch(`/api/companies/${me.body.data.company._id}/verification`).set(auth(admin.token)).send({ status: 'APPROVED' }).expect(200);
  return { admin, company };
}

describe('health & errors', () => {
  test('health check', async () => expect((await api().get('/api/health').expect(200)).body.data.status).toBe('ok'));
  test('unknown route -> 404 JSON', async () => expect((await api().get('/api/nothing').expect(404)).body.success).toBe(false));
});

describe('auth', () => {
  test('register returns token and never the password', async () => {
    const { res } = await registerStudent();
    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
  });
  test('cannot self-register as ADMIN', async () => {
    await api().post('/api/auth/register').send({ name: 'Eve', email: 'eve@x.com', password: 'Passw0rd1', role: 'ADMIN' }).expect(400);
  });
  test('duplicate email -> 409', async () => {
    const s = await registerStudent({ email: 'dup@x.com' });
    expect(s.res.status).toBe(201);
    await api().post('/api/auth/register').send({ name: 'Asha', email: 'dup@x.com', password: 'Passw0rd1', role: 'COMPANY', company: { name: 'X Co' } }).expect(409);
  });
  test('login success and invalid credentials', async () => {
    await registerStudent({ email: 'login@x.com' });
    await api().post('/api/auth/login').send({ email: 'login@x.com', password: 'Passw0rd1' }).expect(200);
    await api().post('/api/auth/login').send({ email: 'login@x.com', password: 'wrong-pass1' }).expect(401);
    await api().post('/api/auth/login').send({ email: 'ghost@x.com', password: 'Passw0rd1' }).expect(401);
  });
  test('protected route needs a token', async () => {
    await api().get('/api/auth/me').expect(401);
    const { token } = await registerStudent();
    await api().get('/api/auth/me').set(auth(token)).expect(200);
  });
  test('role authorization: student cannot list users', async () => {
    const { token } = await registerStudent();
    await api().get('/api/users').set(auth(token)).expect(403);
    const admin = await createAdmin();
    await api().get('/api/users').set(auth(admin.token)).expect(200);
  });
});

describe('jobs', () => {
  test('unapproved company cannot create a job', async () => {
    const company = await registerCompany();
    await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(403);
  });
  test('student cannot create a job (unauthorized)', async () => {
    const { token } = await registerStudent();
    await api().post('/api/jobs').set(auth(token)).send(jobBody()).expect(403);
  });
  test('approved company creates and retrieves a job', async () => {
    const { company } = await approvedCompany();
    const created = await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201);
    const list = await api().get('/api/jobs').set(auth(company.token)).expect(200);
    expect(list.body.data).toHaveLength(1);
    await api().get(`/api/jobs/${created.body.data._id}`).set(auth(company.token)).expect(200);
  });
  test('another company cannot edit this job', async () => {
    const { company } = await approvedCompany();
    const created = await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201);
    const other = await registerCompany({ company: { name: 'Other Ltd' } });
    await api().patch(`/api/jobs/${created.body.data._id}`).set(auth(other.token)).send({ title: 'Hacked' }).expect(403);
  });
  test('student only sees eligible jobs when filtering', async () => {
    const { company } = await approvedCompany();
    await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201);
    const ineligible = await registerStudent({ studentProfile: { enrollmentNo: 'X1', branch: 'ECE', cgpa: 8, activeBacklogs: 0 } });
    const res = await api().get('/api/jobs?eligible=true').set(auth(ineligible.token)).expect(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('applications', () => {
  test('duplicate application is rejected (409) and ineligible student blocked', async () => {
    const { company } = await approvedCompany();
    const job = (await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201)).body.data;
    const student = await registerStudent();
    await api().post('/api/applications').set(auth(student.token)).send({ jobId: job._id }).expect(201);
    await api().post('/api/applications').set(auth(student.token)).send({ jobId: job._id }).expect(409);

    const lowCgpa = await registerStudent({ studentProfile: { enrollmentNo: 'L1', branch: 'CSE', cgpa: 5, activeBacklogs: 0, resumeUrl: 'https://example.com/r.pdf' } });
    await api().post('/api/applications').set(auth(lowCgpa.token)).send({ jobId: job._id }).expect(400);
  });
  test('only the owning company can change status; students cannot', async () => {
    const { company } = await approvedCompany();
    const job = (await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201)).body.data;
    const student = await registerStudent();
    const app = (await api().post('/api/applications').set(auth(student.token)).send({ jobId: job._id }).expect(201)).body.data;

    await api().patch(`/api/applications/${app._id}/status`).set(auth(student.token)).send({ status: 'SHORTLISTED' }).expect(403);
    const stranger = await registerCompany({ company: { name: 'Stranger' } });
    await api().patch(`/api/applications/${app._id}/status`).set(auth(stranger.token)).send({ status: 'SHORTLISTED' }).expect(403);
    await api().patch(`/api/applications/${app._id}/status`).set(auth(company.token)).send({ status: 'SHORTLISTED' }).expect(200);
    await api().patch(`/api/applications/${app._id}/status`).set(auth(company.token)).send({ status: 'SELECTED' }).expect(409); // skipping a stage
  });
  test('a student cannot read another student\'s application by id', async () => {
    const { company } = await approvedCompany();
    const job = (await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201)).body.data;
    const a = await registerStudent();
    const b = await registerStudent();
    const app = (await api().post('/api/applications').set(auth(a.token)).send({ jobId: job._id }).expect(201)).body.data;
    await api().get(`/api/applications/${app._id}`).set(auth(b.token)).expect(404);
  });
});

describe('interview -> offer flow', () => {
  test('schedule interview, create offer, student accepts', async () => {
    const { company } = await approvedCompany();
    const job = (await api().post('/api/jobs').set(auth(company.token)).send(jobBody()).expect(201)).body.data;
    const student = await registerStudent();
    const app = (await api().post('/api/applications').set(auth(student.token)).send({ jobId: job._id }).expect(201)).body.data;
    await api().patch(`/api/applications/${app._id}/status`).set(auth(company.token)).send({ status: 'SHORTLISTED' }).expect(200);
    await api().post('/api/interviews').set(auth(company.token)).send({ applicationId: app._id, scheduledAt: futureISO(2), mode: 'ONLINE', location: 'https://meet.example.com/x' }).expect(201);
    expect((await api().get('/api/interviews/me').set(auth(student.token)).expect(200)).body.data).toHaveLength(1);
    const offer = (await api().post('/api/offers').set(auth(company.token)).send({ applicationId: app._id, packageLPA: 12 }).expect(201)).body.data;
    await api().patch(`/api/offers/${offer._id}/respond`).set(auth(company.token)).send({ response: 'ACCEPTED' }).expect(403);
    await api().patch(`/api/offers/${offer._id}/respond`).set(auth(student.token)).send({ response: 'ACCEPTED' }).expect(200);
    await api().patch(`/api/offers/${offer._id}/respond`).set(auth(student.token)).send({ response: 'DECLINED' }).expect(409);
  });
});
