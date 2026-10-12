import * as service from './feedback.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.createFeedback(req.user, req.body), { status: 201, message: 'Thanks for your feedback' })
);
export const list = asyncHandler(async (req, res) => sendSuccess(res, await service.listFeedback(req.user)));
