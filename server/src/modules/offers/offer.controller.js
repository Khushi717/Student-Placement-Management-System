import * as service from './offer.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.createOffer(req.user, req.body), { status: 201, message: 'Offer created' })
);
export const listMine = asyncHandler(async (req, res) => sendSuccess(res, await service.listMine(req.user)));
export const respond = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.respond(req.user, req.params.id, req.body.response), { message: 'Response recorded' })
);
