import * as service from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await service.register(req.body);
  sendSuccess(res, { user, token }, { status: 201, message: 'Registration successful' });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await service.login(req.body);
  sendSuccess(res, { user, token }, { message: 'Login successful' });
});

/**
 * Logout is STATELESS: JWTs are not stored server-side, so this endpoint cannot revoke a token.
 * The client discards its copy; the token stays technically valid until it expires (JWT_EXPIRES_IN).
 * Mitigations: short expiry, suspended accounts are rejected on every request, and a token
 * deny-list / refresh-token rotation can be added later if immediate revocation is required.
 */
export const logout = (_req, res) =>
  sendSuccess(res, null, { message: 'Logged out on the client. The token remains valid until it expires.' });

export const me = asyncHandler(async (req, res) => sendSuccess(res, await service.getMeWithCompany(req.user)));

export const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user._id, req.body);
  sendSuccess(res, null, { message: 'Password changed' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await service.requestPasswordReset(req.body.email);
  sendSuccess(res, null, { message: 'If an account exists for that e-mail, a reset link has been generated.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await service.resetPassword(req.body);
  sendSuccess(res, null, { message: 'Password has been reset. You can now log in.' });
});
