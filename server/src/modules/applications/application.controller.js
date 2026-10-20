import * as service from './application.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.applyToJob(req.user, req.body), { status: 201, message: 'Application submitted' })
);
export const listMine = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listMine(req.user, req.validatedQuery);
  sendSuccess(res, items, { meta });
});
export const listApplicants = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listApplicants(req.user, req.validatedQuery);
  sendSuccess(res, items, { meta });
});
export const getOne = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.getAuthorizedApplication(req.user, req.params.id, { populateStudent: true }))
);
export const updateStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.updateStatus(req.user, req.params.id, req.body), { message: 'Application status updated' })
);
export const withdraw = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.withdrawApplication(req.user, req.params.id), { message: 'Application withdrawn successfully' })
);
