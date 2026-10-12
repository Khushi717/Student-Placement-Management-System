import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import { idParamSchema } from '../users/user.validators.js';
import * as c from './interview.controller.js';
import { createInterviewSchema, updateInterviewSchema } from './interview.validators.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ body: createInterviewSchema }), c.create);
router.get('/me', c.listMine);
router.patch('/:id', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ params: idParamSchema, body: updateInterviewSchema }), c.update);

export default router;
