import * as userService from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

export const getMe = asyncHandler(async (req, res) => sendSuccess(res, req.user));

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body);
  sendSuccess(res, user, { message: 'Profile updated' });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { items, meta } = await userService.listUsers(req.validatedQuery);
  sendSuccess(res, items, { meta });
});

export const getUser = asyncHandler(async (req, res) => sendSuccess(res, await userService.getUserById(req.params.id)));

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(req.user, req.params.id, req.body.status);
  sendSuccess(res, user, { message: `User ${user.status.toLowerCase()}` });
});
