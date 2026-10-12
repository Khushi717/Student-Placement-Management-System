import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema } from '../users/user.validators.js';
import * as c from './notification.controller.js';

const router = Router();
router.use(authenticate); // every role can read their own notifications; queries are scoped to req.user

router.get('/', c.list);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', validate({ params: idParamSchema }), c.markRead);

export default router;
