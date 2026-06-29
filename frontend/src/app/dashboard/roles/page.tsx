'use client';
import { Box, Typography } from '@mui/material';
import RbacTable from '@/components/dashboard/RbacTable';

export default function RolesPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
          Roles & Permissions
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage system access levels and permissions for all administrative and user roles.
        </Typography>
      </Box>

      <RbacTable />
    </Box>
  );
}
