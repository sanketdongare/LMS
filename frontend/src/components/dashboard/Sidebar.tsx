'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, Chip, Tooltip, Collapse,
} from '@mui/material';
import {
  Dashboard, School, People, MenuBook, Notifications, Settings,
  ExpandLess, ExpandMore, AdminPanelSettings, Analytics, Logout, AccountBalance, Class, Security,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 260;

const navItems = [
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    href: '/dashboard',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    label: 'Universities',
    icon: <School />,
    href: '/dashboard/universities',
    roles: ['SUPER_ADMIN'],
    badge: 'Admin',
  },
  {
    label: 'Institutes',
    icon: <AccountBalance />,
    href: '/dashboard/institutes',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN'],
  },
  {
    label: 'Programs & Batches',
    icon: <Class />,
    href: '/dashboard/programs',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'],
  },
  {
    label: 'Courses',
    icon: <MenuBook />,
    href: '/dashboard/courses',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    label: 'Users',
    icon: <People />,
    href: '/dashboard/users',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Roles & Permissions',
    icon: <Security />,
    href: '/dashboard/roles',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Analytics',
    icon: <Analytics />,
    href: '/dashboard/analytics',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'],
  },
  {
    label: 'Notifications',
    icon: <Notifications />,
    href: '/dashboard/notifications',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    label: 'Settings',
    icon: <Settings />,
    href: '/dashboard/settings',
    roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
];

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  SUPER_ADMIN: 'secondary',
  UNIVERSITY_ADMIN: 'primary',
  INSTITUTE_ADMIN: 'warning',
  INSTRUCTOR: 'success',
  STUDENT: 'info',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  UNIVERSITY_ADMIN: 'Uni Admin',
  INSTITUTE_ADMIN: 'Inst Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

export default function Sidebar({ open, onClose, variant = 'permanent' }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { unreadCount } = useAppSelector((s) => s.notifications);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Signed out successfully');
    router.push('/auth/login');
  };

  const filteredNav = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex' }}>
          <School sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} className="gradient-text" sx={{ lineHeight: 1.2 }}>
            SDLMS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Learning Platform
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(99,102,241,0.15)' }} />

      {/* User Profile */}
      {user && (
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(99,102,241,0.08)' }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '1rem', fontWeight: 700 }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {user.name}
              </Typography>
              <Chip
                label={roleLabels[user.role] || user.role}
                color={roleColors[user.role] || 'default'}
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', mt: 0.3 }}
              />
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(99,102,241,0.15)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={variant === 'temporary' ? onClose : undefined}
                className={isActive ? 'sidebar-item-active' : ''}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(99,102,241,0.1)',
                    transform: 'translateX(4px)',
                  },
                  ...(isActive && {
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '& .MuiListItemText-primary': { color: 'primary.light', fontWeight: 700 },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}
                />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <Chip
                    label={unreadCount > 99 ? '99+' : unreadCount}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.65rem', minWidth: 20 }}
                  />
                )}
                {item.badge && (
                  <Chip label={item.badge} size="small" color="secondary" sx={{ height: 18, fontSize: '0.6rem' }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(99,102,241,0.15)' }} />

      {/* Logout */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          id="sidebar-logout-btn"
          onClick={handleLogout}
          sx={{ borderRadius: 2, py: 1, color: 'error.main', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop: permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
