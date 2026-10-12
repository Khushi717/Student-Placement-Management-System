import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import * as c from './feedback.controller.js';
import { createFeedbackSchema } from './feedback.validators.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize(ROLES.STUDENT), validate({ body: createFeedbackSchema }), c.create);
router.get('/', authorize(ROLES.STUDENT, ROLES.ADMIN), c.list);

export default router;
