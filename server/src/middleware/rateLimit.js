import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = (opts) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { success: false, message: 'Too many attempts, please try again later' },
    ...opts,
  });

/** Brute-force protection for login: 10 attempts / 15 min / IP. */
export const loginLimiter = make({ windowMs: 15 * 60 * 1000, max: 10 });
/** Generic limiter for sensitive endpoints (register, forgot password). */
export const sensitiveLimiter = make({ windowMs: 15 * 60 * 1000, max: 30 });
