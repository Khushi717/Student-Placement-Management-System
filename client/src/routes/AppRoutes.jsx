import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

import LandingPage from '../pages/public/LandingPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import NotificationsPage from '../pages/shared/NotificationsPage';

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import AvailableDrivesPage from '../pages/student/AvailableDrivesPage';
import JobDetailsPage from '../pages/student/JobDetailsPage';
import MyApplicationsPage from '../pages/student/MyApplicationsPage';
import InterviewSchedulePage from '../pages/student/InterviewSchedulePage';
import OffersPage from '../pages/student/OffersPage';
import StudentFeedbackPage from '../pages/student/StudentFeedbackPage';

import CompanyDashboard from '../pages/company/CompanyDashboard';
import CompanyProfilePage from '../pages/company/CompanyProfilePage';
import CreateJobPage from '../pages/company/CreateJobPage';
import ManageJobsPage from '../pages/company/ManageJobsPage';
import ApplicantsPage from '../pages/company/ApplicantsPage';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsersPage from '../pages/admin/ManageUsersPage';
import VerifyCompaniesPage from '../pages/admin/VerifyCompaniesPage';
import AdminJobsPage from '../pages/admin/AdminJobsPage';
import AdminApplicationsPage from '../pages/admin/AdminApplicationsPage';
import AdminInterviewsPage from '../pages/admin/AdminInterviewsPage';
import PlacementAnalyticsPage from '../pages/admin/PlacementAnalyticsPage';
import FeedbackManagementPage from '../pages/admin/FeedbackManagementPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleGuard allow={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/jobs" element={<AvailableDrivesPage />} />
            <Route path="/student/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/student/applications" element={<MyApplicationsPage />} />
            <Route path="/student/interviews" element={<InterviewSchedulePage />} />
            <Route path="/student/offers" element={<OffersPage />} />
            <Route path="/student/feedback" element={<StudentFeedbackPage />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<RoleGuard allow={['COMPANY']} />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/jobs" element={<ManageJobsPage />} />
            <Route path="/company/jobs/new" element={<CreateJobPage />} />
            <Route path="/company/applicants" element={<ApplicantsPage />} />
            <Route path="/company/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<RoleGuard allow={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/companies" element={<VerifyCompaniesPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/interviews" element={<AdminInterviewsPage />} />
            <Route path="/admin/analytics" element={<PlacementAnalyticsPage />} />
            <Route path="/admin/feedback" element={<FeedbackManagementPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
