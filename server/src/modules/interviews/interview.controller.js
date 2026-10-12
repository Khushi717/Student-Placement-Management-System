import * as service from './interview.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.scheduleInterview(req.user, req.body), { status: 201, message: 'Interview scheduled' })
);
export const listMine = asyncHandler(async (req, res) => sendSuccess(res, await service.listMine(req.user)));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.updateInterview(req.user, req.params.id, req.body), { message: 'Interview updated' })
);
