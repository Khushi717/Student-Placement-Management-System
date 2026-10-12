import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import companyRoutes from '../modules/companies/company.routes.js';
import jobRoutes from '../modules/jobs/job.routes.js';
import applicationRoutes from '../modules/applications/application.routes.js';
import interviewRoutes from '../modules/interviews/interview.routes.js';
import offerRoutes from '../modules/offers/offer.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import reportRoutes from '../modules/reports/report.routes.js';
import feedbackRoutes from '../modules/feedback/feedback.routes.js';

// Single place where modules are registered. Modules only depend "downwards" on models/services,
// never on each other's routes, so there are no circular imports.
const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/feedback', feedbackRoutes);

export default router;
