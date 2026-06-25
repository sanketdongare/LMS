'use client';
import { Box, Typography, Chip } from '@mui/material';
import { Settings } from '@mui/icons-material';

export default function SettingsPage() {
  return (
    <Box className="page-content" sx={{ textAlign: 'center', py: 8 }}>
      <Settings sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700 }} className="gradient-text">Settings</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1 }}>Account & platform settings</Typography>
      <Chip label="Coming Soon" color="secondary" sx={{ mt: 2 }} />
    </Box>
  );
}
