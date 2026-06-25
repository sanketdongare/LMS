'use client';
import { Box, Typography, Chip } from '@mui/material';
import { Notifications } from '@mui/icons-material';

export default function NotificationsPage() {
  return (
    <Box className="page-content" sx={{ textAlign: 'center', py: 8 }}>
      <Notifications sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700 }} className="gradient-text">Notifications</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1 }}>View all notifications</Typography>
      <Chip label="Coming Soon" color="secondary" sx={{ mt: 2 }} />
    </Box>
  );
}
