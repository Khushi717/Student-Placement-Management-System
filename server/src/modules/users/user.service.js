import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';
import { getPagination, pageMeta } from '../../utils/pagination.js';

export async function updateProfile(user, updates) {
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;

  if (updates.studentProfile) {
    if (user.role !== ROLES.STUDENT) throw ApiError.badRequest('Only students have an academic profile');
    const current = user.studentProfile?.toObject?.() ?? {};
    user.studentProfile = { ...current, ...updates.studentProfile };
  }
  await user.save();
  return user;
}

export async function listUsers(query) {
  const pg = getPagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { 'studentProfile.enrollmentNo': rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    User.countDocuments(filter),
  ]);
  return { items, meta: pageMeta(total, pg) };
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function setUserStatus(actor, id, status) {
  if (String(actor._id) === String(id)) throw ApiError.badRequest('You cannot change your own account status');
  const user = await getUserById(id);
  user.status = status;
  await user.save();
  return user;
}
