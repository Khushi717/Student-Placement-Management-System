import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import * as c from './report.controller.js';
import { placementsQuerySchema, generateReportSchema } from './report.validators.js';

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN)); // analytics are TPO/Admin only

router.get('/dashboard', c.dashboard);
router.get('/placements', validate({ query: placementsQuerySchema }), c.placements);
router.post('/generate', validate({ body: generateReportSchema }), c.generate); // returns 501 until implemented

export default router;
