import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { loginLimiter, sensitiveLimiter } from '../../middleware/rateLimit.js';
import * as c from './auth.controller.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validators.js';

const router = Router();

router.post('/register', sensitiveLimiter, validate({ body: registerSchema }), c.register);
router.post('/login', loginLimiter, validate({ body: loginSchema }), c.login);
router.post('/logout', c.logout);
router.get('/me', authenticate, c.me);
router.patch('/change-password', authenticate, validate({ body: changePasswordSchema }), c.changePassword);
router.post('/forgot-password', sensitiveLimiter, validate({ body: forgotPasswordSchema }), c.forgotPassword);
router.post('/reset-password', sensitiveLimiter, validate({ body: resetPasswordSchema }), c.resetPassword);

export default router;
