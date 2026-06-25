'use client';
import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Badge, Box, Avatar,
  Popover, List, ListItem, ListItemText, Divider, Button, Chip,
  Tooltip, CircularProgress,
} from '@mui/material';
import {
  Menu, Notifications, NotificationsNone, WifiTethering,
  DoneAll, Circle,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { markAsRead, markAllAsRead, setNotifications } from '@/store/slices/notificationSlice';
import { DRAWER_WIDTH } from './Sidebar';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/store/slices/notificationSlice';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

const typeColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export default function Topbar({ onMenuClick, title = 'Dashboard' }: TopbarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { notifications, unreadCount } = useAppSelector((s) => s.notifications);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get('/notifications?limit=20');
        dispatch(setNotifications({ notifications: res.data.data, unreadCount: res.data.unreadCount }));
      } catch (e) {
        console.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [user, dispatch]);

  // Socket.io real-time
  useEffect(() => {
    const socket = getSocket();

    socket.on('users:online', (count: number) => setOnlineUsers(count));
    socket.on('university:created', (university: any) => {
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: 'New University Added',
        message: `"${university.name}" (${university.code}) was just created.`,
        type: 'SUCCESS',
        read: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'notifications/addNotification', payload: newNotif });
      toast.success(`New university: ${university.name}`, { icon: '🏛️' });
    });

    return () => {
      socket.off('users:online');
      socket.off('university:created');
    };
  }, [dispatch]);

  const handleMarkRead = async (id: string) => {
    dispatch(markAsRead(id));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllAsRead());
    try {
      await api.patch('/notifications/read-all');
      toast.success('All notifications marked as read');
    } catch (e) {}
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` } }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Mobile menu toggle */}
        <IconButton
          id="topbar-menu-toggle"
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
        >
          <Menu />
        </IconButton>

        {/* Page Title */}
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
          {title}
        </Typography>

        {/* Online users indicator */}
        <Tooltip title={`${onlineUsers} users online`}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <WifiTethering sx={{ fontSize: 16, color: '#10b981' }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              {onlineUsers}
            </Typography>
          </Box>
        </Tooltip>

        {/* Notification Bell */}
        <Tooltip title="Notifications">
          <IconButton
            id="notification-bell-btn"
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              {unreadCount > 0 ? (
                <Notifications className="notification-dot" />
              ) : (
                <NotificationsNone />
              )}
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar */}
        <Avatar
          src={user?.avatar}
          sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </Toolbar>

      {/* Notifications Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            background: '#ffffff',
            border: '1px solid rgba(8, 145, 178, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(8, 145, 178, 0.12)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(8, 145, 178, 0.15)' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
            {unreadCount > 0 && (
              <Chip label={unreadCount} size="small" color="error" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAll />} onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', color: 'primary.main' }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notification List */}
        <Box sx={{ overflowY: 'auto', maxHeight: 380 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary" variant="body2">No notifications yet</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notif, idx) => (
                <Box key={notif.id}>
                  <ListItem
                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                    sx={{
                      cursor: notif.read ? 'default' : 'pointer',
                      background: notif.read ? 'transparent' : 'rgba(8, 145, 178, 0.06)',
                      '&:hover': { background: 'rgba(8, 145, 178, 0.1)' },
                      alignItems: 'flex-start',
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ mr: 1.5, mt: 0.5 }}>
                      <Circle sx={{ fontSize: 8, color: notif.read ? 'transparent' : 'primary.main' }} />
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                          <Typography variant="body2" fontWeight={notif.read ? 400 : 600} noWrap sx={{ maxWidth: 230 }}>
                            {notif.title}
                          </Typography>
                          <Chip label={notif.type} size="small" color={typeColors[notif.type] || 'default'} sx={{ height: 16, fontSize: '0.6rem' }} />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.3 }}>
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(8, 145, 178, 0.1)' }} />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </AppBar>
  );
}
