import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../modules/users/user.model.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

/** Verifies the Bearer JWT, loads the user from the DB and attaches it as req.user. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  // Always re-read the user so role/status changes take effect immediately.
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (user.status !== ACCOUNT_STATUS.ACTIVE) throw ApiError.forbidden('Account is suspended');

  req.user = user;
  next();
});

/** Role gate. Usage: router.get('/x', authenticate, authorize(ROLES.ADMIN), handler) */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};
