import * as service from './company.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listCompanies(req.user, req.validatedQuery);
  sendSuccess(res, items, { meta });
});
export const getMine = asyncHandler(async (req, res) => sendSuccess(res, await service.requireCompanyForUser(req.user._id)));
export const getOne = asyncHandler(async (req, res) => sendSuccess(res, await service.getCompany(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.updateCompany(req.user, req.params.id, req.body), { message: 'Company updated' })
);
export const verify = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.setVerification(req.user, req.params.id, req.body), { message: 'Verification updated' })
);
