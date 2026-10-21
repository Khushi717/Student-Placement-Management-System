import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import { idParamSchema } from '../users/user.validators.js';
import * as c from './application.controller.js';
import { createApplicationSchema, updateApplicationStatusSchema, listApplicationsQuerySchema } from './application.validators.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize(ROLES.STUDENT), validate({ body: createApplicationSchema }), c.create);
router.get('/me', authorize(ROLES.STUDENT), validate({ query: listApplicationsQuerySchema }), c.listMine);
// Applicant list: companies see only their own jobs' applicants, admins see all.
router.get('/', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ query: listApplicationsQuerySchema }), c.listApplicants);
router.get('/:id', validate({ params: idParamSchema }), c.getOne);
router.patch('/:id/withdraw', authorize(ROLES.STUDENT), validate({ params: idParamSchema }), c.withdraw);
router.patch('/:id/status', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ params: idParamSchema, body: updateApplicationStatusSchema }), c.updateStatus);

export default router;
