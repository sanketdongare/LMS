'use client';
import { Box, Typography, Chip } from '@mui/material';
import { Analytics } from '@mui/icons-material';

export default function AnalyticsPage() {
  return (
    <Box className="page-content" sx={{ textAlign: 'center', py: 8 }}>
      <Analytics sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700 }} className="gradient-text">Analytics</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1 }}>Platform analytics & reports</Typography>
      <Chip label="Coming Soon" color="secondary" sx={{ mt: 2 }} />
    </Box>
  );
}
