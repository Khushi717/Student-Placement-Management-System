import * as service from './report.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const dashboard = asyncHandler(async (_req, res) => sendSuccess(res, await service.getDashboard()));
export const placements = asyncHandler(async (req, res) => sendSuccess(res, await service.getPlacementRecords(req.validatedQuery)));
export const generate = asyncHandler(async (req, res) => sendSuccess(res, await service.generateReport(req.body)));
