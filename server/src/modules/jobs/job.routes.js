import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import { idParamSchema } from '../users/user.validators.js';
import * as c from './job.controller.js';
import { createJobSchema, updateJobSchema, jobStatusSchema, listJobsQuerySchema } from './job.validators.js';

const router = Router();
router.use(authenticate);

// Ownership (company -> own jobs only) and visibility (student -> published only) are enforced in the service.
router.get('/', validate({ query: listJobsQuerySchema }), c.list);
router.get('/:id', validate({ params: idParamSchema }), c.getOne);

router.post('/', authorize(ROLES.COMPANY), validate({ body: createJobSchema }), c.create);
router.patch('/:id', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ params: idParamSchema, body: updateJobSchema }), c.update);
router.patch('/:id/status', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ params: idParamSchema, body: jobStatusSchema }), c.setStatus);
router.delete('/:id', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ params: idParamSchema }), c.remove);

export default router;
