import crypto from 'crypto';
import { User } from '../users/user.model.js';
import { createCompanyForUser } from '../companies/company.service.js';
import { Company } from '../companies/company.model.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';
import { ACCOUNT_STATUS, ROLES } from '../../utils/constants.js';
import { env } from '../../config/env.js';
import { notify } from '../notifications/notification.service.js';

// Real bcrypt hash computed once, so a login for an unknown e-mail costs about the same as a known one (timing side-channel).
let dummyHash;
const getDummyHash = () => (dummyHash ??= hashPassword('not-a-real-password-1'));

export async function register(payload) {
  const existing = await User.findOne({ email: payload.email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  // Role comes from the *validated* body (STUDENT | COMPANY only); ADMIN is impossible here.
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    password: await hashPassword(payload.password),
    ...(payload.role === ROLES.STUDENT && { studentProfile: payload.studentProfile }),
  });

  if (payload.role === ROLES.COMPANY) {
    try {
      await createCompanyForUser(user._id, payload.company);
    } catch (err) {
      await User.deleteOne({ _id: user._id }); // keep User and Company consistent (no multi-doc transaction on standalone Mongo)
      throw err;
    }
    // Let admins know a company is waiting for verification.
    const admins = await User.find({ role: ROLES.ADMIN, status: ACCOUNT_STATUS.ACTIVE }).select('_id');
    await Promise.all(
      admins.map((a) =>
        notify(a._id, {
          type: 'COMPANY',
          title: 'New company awaiting verification',
          message: `${payload.company.name} has registered and needs verification.`,
          link: '/admin/companies',
        })
      )
    );
  }

  return { user, token: signToken(user) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  const ok = await comparePassword(password, user?.password || (await getDummyHash()));
  if (!user || !ok) throw ApiError.unauthorized('Invalid email or password');
  if (user.status !== ACCOUNT_STATUS.ACTIVE) throw ApiError.forbidden('Account is suspended. Contact the placement cell.');

  user.lastLoginAt = new Date();
  await user.save();
  return { user, token: signToken(user) };
}

export async function getMeWithCompany(user) {
  const company = user.role === ROLES.COMPANY ? await Company.findOne({ user: user._id }) : null;
  return { user, company };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!(await comparePassword(currentPassword, user.password))) throw ApiError.badRequest('Current password is incorrect');
  user.password = await hashPassword(newPassword);
  await user.save();
}

/**
 * Forgot-password FOUNDATION: generates a one-time token (only its hash is stored, 30 min expiry).
 * There is no e-mail provider yet, so in non-production the reset link is printed to the server console.
 * TODO: plug an e-mail service in here. The HTTP response is always generic to avoid account enumeration.
 */
export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user || user.status !== ACCOUNT_STATUS.ACTIVE) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  if (!env.isProd) {
    console.log(`[dev] Password reset link for ${email}: ${env.clientOrigins[0]}/reset-password?token=${rawToken}`);
  }
}

export async function resetPassword({ token, password }) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } }).select(
    '+passwordResetToken +passwordResetExpires'
  );
  if (!user) throw ApiError.badRequest('Reset token is invalid or has expired');
  user.password = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
}
