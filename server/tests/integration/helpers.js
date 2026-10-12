import '../setup.js';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import { User } from '../../src/modules/users/user.model.js';
import { hashPassword } from '../../src/utils/password.js';

let memory;

/** Uses MONGODB_URI_TEST if provided, otherwise spins up mongodb-memory-server (needs to download a binary once). */
export async function startDb() {
  let uri = process.env.MONGODB_URI_TEST;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memory = await MongoMemoryServer.create();
    uri = memory.getUri();
  }
  await connectDB(uri);
}
export async function stopDb() {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
  if (memory) await memory.stop();
}
export async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

export const api = () => request(app);
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export async function registerStudent(over = {}) {
  const res = await api().post('/api/auth/register').send({
    name: 'Asha Verma', email: `asha${Math.random().toString(36).slice(2, 7)}@x.com`, password: 'Passw0rd1', role: 'STUDENT',
    studentProfile: { enrollmentNo: `E${Math.random().toString(36).slice(2, 9)}`, branch: 'CSE', cgpa: 8.2, activeBacklogs: 0, resumeUrl: 'https://example.com/r.pdf' },
    ...over,
  });
  return { token: res.body.data.token, user: res.body.data.user, res };
}
export async function registerCompany(over = {}) {
  const res = await api().post('/api/auth/register').send({
    name: 'Rohan HR', email: `hr${Math.random().toString(36).slice(2, 7)}@acme.com`, password: 'Passw0rd1', role: 'COMPANY',
    company: { name: 'Acme Corp', industry: 'Software' }, ...over,
  });
  return { token: res.body.data.token, user: res.body.data.user };
}
export async function createAdmin() {
  const email = 'admin@spms.test';
  await User.create({ name: 'TPO', email, password: await hashPassword('Passw0rd1'), role: 'ADMIN' });
  const res = await api().post('/api/auth/login').send({ email, password: 'Passw0rd1' });
  return { token: res.body.data.token };
}
export const futureISO = (days = 7) => new Date(Date.now() + days * 86400000).toISOString();
