'use client';
import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { useAppSelector } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, initialized } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [user, initialized, router]);

  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 60, height: 60, borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <CircularProgress size={28} sx={{ color: 'white' }} />
          </Box>
          <Box className="gradient-text" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>SDLMS</Box>
        </Box>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
