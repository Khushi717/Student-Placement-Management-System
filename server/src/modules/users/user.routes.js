import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import * as c from './user.controller.js';
import { updateMeSchema, idParamSchema, listUsersQuerySchema, updateUserStatusSchema } from './user.validators.js';

const router = Router();
router.use(authenticate);

router.get('/me', c.getMe);
router.patch('/me', validate({ body: updateMeSchema }), c.updateMe);

// Admin-only user management
router.get('/', authorize(ROLES.ADMIN), validate({ query: listUsersQuerySchema }), c.listUsers);
router.get('/:id', authorize(ROLES.ADMIN), validate({ params: idParamSchema }), c.getUser);
router.patch('/:id/status', authorize(ROLES.ADMIN), validate({ params: idParamSchema, body: updateUserStatusSchema }), c.updateUserStatus);

export default router;
