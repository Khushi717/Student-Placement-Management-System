import * as service from './job.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.createJob(req.user, req.body), { status: 201, message: 'Job created' })
);
export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listJobs(req.user, req.validatedQuery);
  sendSuccess(res, items, { meta });
});
export const getOne = asyncHandler(async (req, res) => sendSuccess(res, await service.getJob(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.updateJob(req.user, req.params.id, req.body), { message: 'Job updated' })
);
export const setStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.setJobStatus(req.user, req.params.id, req.body.status), { message: 'Job status updated' })
);
export const remove = asyncHandler(async (req, res) => {
  await service.deleteJob(req.user, req.params.id);
  sendSuccess(res, null, { message: 'Job deleted' });
});
