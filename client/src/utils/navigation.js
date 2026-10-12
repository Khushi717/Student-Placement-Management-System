import { LayoutDashboard, User, Briefcase, FileText, CalendarClock, Gift, Bell, MessageSquare, Building2, PlusCircle, Users, ShieldCheck, BarChart3, ClipboardList } from 'lucide-react';

export const ROLE_HOME = { STUDENT: '/student/dashboard', COMPANY: '/company/dashboard', ADMIN: '/admin/dashboard' };

export const NAV_ITEMS = {
  STUDENT: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/jobs', label: 'Available Drives', icon: Briefcase },
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/student/interviews', label: 'Interviews', icon: CalendarClock },
    { to: '/student/offers', label: 'Offers', icon: Gift },
    { to: '/student/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  COMPANY: [
    { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/company/profile', label: 'Company Profile', icon: Building2 },
    { to: '/company/jobs/new', label: 'Create Job', icon: PlusCircle },
    { to: '/company/jobs', label: 'Manage Postings', icon: Briefcase },
    { to: '/company/applicants', label: 'Applicants', icon: Users },
    { to: '/company/notifications', label: 'Notifications', icon: Bell },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/companies', label: 'Verify Companies', icon: ShieldCheck },
    { to: '/admin/jobs', label: 'Job Postings', icon: Briefcase },
    { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
    { to: '/admin/interviews', label: 'Interviews', icon: CalendarClock },
    { to: '/admin/analytics', label: 'Placement Analytics', icon: BarChart3 },
    { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
};
