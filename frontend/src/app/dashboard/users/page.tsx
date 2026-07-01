'use client';
import { Box, Alert } from '@mui/material';
import { useAppSelector } from '@/store/store';
import AdminManagePanel from '@/components/AdminManagePanel';

export default function UsersPage() {
  const { user: currentUser } = useAppSelector((s) => s.auth);

  const allowedRoles = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'];
  if (!allowedRoles.includes(currentUser?.role || '')) {
    return (
      <Box className="page-content" sx={{ p: 3 }}>
        <Alert severity="error">Access denied. You do not have permission to manage users.</Alert>
      </Box>
    );
  }

  const titles: Record<string, { title: string; subtitle: string }> = {
    SUPER_ADMIN: {
      title: 'User Management',
      subtitle: 'Create, manage, and control all users across the entire platform.',
    },
    UNIVERSITY_ADMIN: {
      title: 'Manage Users',
      subtitle: 'Create and manage Institute Admins, Instructors, and Students for your university.',
    },
    INSTITUTE_ADMIN: {
      title: 'Manage Users',
      subtitle: 'Create and manage Instructors and Students for your institute.',
    },
  };

  const config = titles[currentUser?.role || ''] || titles['SUPER_ADMIN'];

  return (
    <Box className="page-content">
      <AdminManagePanel title={config.title} subtitle={config.subtitle} />
    </Box>
  );
}
