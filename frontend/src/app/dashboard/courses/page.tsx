'use client';
import { Box, Typography, Chip } from '@mui/material';
import { MenuBook } from '@mui/icons-material';

export default function CoursesPage() {
  return (
    <Box className="page-content" sx={{ textAlign: 'center', py: 8 }}>
      <MenuBook sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700 }} className="gradient-text">Courses</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1 }}>Course management coming soon</Typography>
      <Chip label="Coming Soon" color="secondary" sx={{ mt: 2 }} />
    </Box>
  );
}
