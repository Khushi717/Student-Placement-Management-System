import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import { idParamSchema } from '../users/user.validators.js';
import * as c from './company.controller.js';
import { updateCompanySchema, verifyCompanySchema, listCompaniesQuerySchema } from './company.validators.js';

// Company *registration* happens through POST /api/auth/register (role=COMPANY), which creates the
// User and the Company together, so there is no separate public /companies/register endpoint.
const router = Router();
router.use(authenticate);

router.get('/', validate({ query: listCompaniesQuerySchema }), c.list);
router.get('/me', authorize(ROLES.COMPANY), c.getMine);
router.get('/:id', validate({ params: idParamSchema }), c.getOne);
router.patch('/:id', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ params: idParamSchema, body: updateCompanySchema }), c.update);
router.patch('/:id/verification', authorize(ROLES.ADMIN), validate({ params: idParamSchema, body: verifyCompanySchema }), c.verify);

export default router;
