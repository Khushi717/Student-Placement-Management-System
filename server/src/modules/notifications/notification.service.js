import { Notification } from './notification.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, pageMeta } from '../../utils/pagination.js';

/**
 * Integration point used by other modules (applications, offers, companies...).
 * It never throws: a failed notification must not break the business action that triggered it.
 * Future extension: fan out to email/SMS/push from here without touching callers.
 */
export async function notify(userId, { type = 'GENERAL', title, message, link }) {
  try {
    return await Notification.create({ user: userId, type, title, message, link });
  } catch (err) {
    console.error('[notify] failed:', err.message);
    return null;
  }
}

export async function listForUser(userId, query) {
  const pg = getPagination(query);
  const filter = { user: userId };
  if (query.unread === 'true') filter.isRead = false;
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);
  return { items, meta: { ...pageMeta(total, pg), unreadCount } };
}

export async function markRead(userId, id) {
  // Scoped by user so one user can never touch another user's notification by guessing an id.
  const n = await Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true });
  if (!n) throw ApiError.notFound('Notification not found');
  return n;
}

export async function markAllRead(userId) {
  const res = await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  return { modified: res.modifiedCount };
}
