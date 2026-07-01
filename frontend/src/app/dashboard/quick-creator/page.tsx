'use client';
import { Box, Typography } from '@mui/material';
import QuickCreatorWizard from '@/components/dashboard/QuickCreatorWizard';

export default function QuickCreatorPage() {
  return (
    <Box className="page-content" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
          Quick Creator Wizard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Create academic entities (Programs, Batches, Semesters, Courses, Units, and Quizzes) instantly anywhere in the hierarchy.
        </Typography>
      </Box>

      <QuickCreatorWizard />
    </Box>
  );
}
