import * as service from './notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listForUser(req.user._id, req.query);
  sendSuccess(res, items, { meta });
});
export const markRead = asyncHandler(async (req, res) => sendSuccess(res, await service.markRead(req.user._id, req.params.id)));
export const markAllRead = asyncHandler(async (req, res) => sendSuccess(res, await service.markAllRead(req.user._id)));
