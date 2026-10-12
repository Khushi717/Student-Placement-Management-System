import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../utils/constants.js';
import { idParamSchema } from '../users/user.validators.js';
import * as c from './offer.controller.js';
import { createOfferSchema, respondOfferSchema } from './offer.validators.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize(ROLES.COMPANY, ROLES.ADMIN), validate({ body: createOfferSchema }), c.create);
router.get('/me', c.listMine);
router.patch('/:id/respond', authorize(ROLES.STUDENT), validate({ params: idParamSchema, body: respondOfferSchema }), c.respond);

export default router;
