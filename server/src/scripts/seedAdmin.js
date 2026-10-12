// Creates the first TPO/Admin account. Admins cannot self-register through the public API.
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../modules/users/user.model.js';
import { hashPassword } from '../utils/password.js';
import { ROLES } from '../utils/constants.js';

const name = process.env.SEED_ADMIN_NAME || 'TPO Admin';
const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env first.');
  process.exit(1);
}

await connectDB(env.mongoUri);
const existing = await User.findOne({ email });
if (existing) {
  console.log(`Admin already exists: ${email}`);
} else {
  await User.create({ name, email, password: await hashPassword(password), role: ROLES.ADMIN });
  console.log(`Admin created: ${email}`);
}
await disconnectDB();
