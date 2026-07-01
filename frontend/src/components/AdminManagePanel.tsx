'use client';
import { useState, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Avatar, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Skeleton, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Select, FormControl, InputLabel, Alert, CircularProgress,
  Divider, InputAdornment as MuiInputAdornment,
} from '@mui/material';
import {
  Search, Edit, People, Refresh, Cancel, Add,
  ToggleOn, ToggleOff, Delete, Visibility, VisibilityOff,
  PersonAdd, AdminPanelSettings,
} from '@mui/icons-material';
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useCreateAdminUserMutation,
  useToggleUserActiveMutation,
  useDeleteUserMutation,
} from '@/store/slices/lmsSlice';
import { useAppSelector } from '@/store/store';
import toast from 'react-hot-toast';

export const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  UNIVERSITY_ADMIN: 'Uni Admin',
  INSTITUTE_ADMIN: 'Inst Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
};

export const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  SUPER_ADMIN: 'secondary',
  UNIVERSITY_ADMIN: 'primary',
  INSTITUTE_ADMIN: 'warning',
  INSTRUCTOR: 'success',
  STUDENT: 'info',
};

// Role-specific allowed roles for creation
const allowedRolesToCreate: Record<string, string[]> = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
  UNIVERSITY_ADMIN: ['INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT'],
  INSTITUTE_ADMIN: ['INSTRUCTOR', 'STUDENT'],
};

interface AdminManagePanelProps {
  title?: string;
  subtitle?: string;
  defaultRoleFilter?: string;
}

export default function AdminManagePanel({
  title = 'User Management',
  subtitle = 'Create and manage users across the platform.',
  defaultRoleFilter = '',
}: AdminManagePanelProps) {
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const currentRole = currentUser?.role || '';
  const creatableRoles = allowedRolesToCreate[currentRole] || [];

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState(defaultRoleFilter);

  // Dialog states
  const [editUser, setEditUser] = useState<any | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [form, setForm] = useState({ name: '', email: '', password: '', role: creatableRoles[0] || '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // RTK hooks
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page: page + 1, limit: rowsPerPage, search, role: roleFilter || undefined,
  });

  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
  const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [toggleUserActive, { isLoading: isToggling }] = useToggleUserActiveMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleSearch = useCallback(() => { setSearch(searchInput); setPage(0); }, [searchInput]);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  // Edit role
  const handleSaveRole = async () => {
    if (!editUser || !targetRole) return;
    try {
      await updateUserRole({ id: editUser.id, role: targetRole }).unwrap();
      toast.success('Role updated successfully');
      setEditUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update role');
    }
  };

  // Toggle active
  const handleToggleActive = async (usr: any) => {
    try {
      const res = await toggleUserActive(usr.id).unwrap();
      toast.success(res.message || 'Status updated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id).unwrap();
      toast.success('User deleted successfully');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  // Create admin
  const handleCreate = async () => {
    setFormError('');
    if (!form.name || !form.email || !form.password || !form.role) {
      setFormError('All fields are required.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    try {
      const res = await createAdminUser(form).unwrap();
      toast.success(res.message || 'User created successfully');
      setCreateOpen(false);
      setForm({ name: '', email: '', password: '', role: creatableRoles[0] || '' });
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to create user');
    }
  };

  // Filter chips shown based on current user's role
  const filterableRoles = currentRole === 'SUPER_ADMIN'
    ? Object.entries(roleLabels)
    : currentRole === 'UNIVERSITY_ADMIN'
    ? [['INSTITUTE_ADMIN', 'Inst Admin'], ['INSTRUCTOR', 'Instructor'], ['STUDENT', 'Student']]
    : [['INSTRUCTOR', 'Instructor'], ['STUDENT', 'Student']];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            <span className="gradient-text">{title}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => refetch()} disabled={isFetching} sx={{ border: '1px solid rgba(8,145,178,0.3)', borderRadius: 2 }}>
                <Refresh sx={{ fontSize: 20, ...(isFetching && { animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }) }} />
              </IconButton>
            </span>
          </Tooltip>
          {creatableRoles.length > 0 && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => { setCreateOpen(true); setFormError(''); }}
              sx={{
                borderRadius: 2, fontWeight: 700,
                background: 'linear-gradient(135deg, #0891b2, #0d9488)',
                boxShadow: '0 4px 14px rgba(8,145,178,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' },
              }}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {/* Search & Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{ minWidth: 280, flex: 1, maxWidth: 440 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}>
                  <Cancel sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select value={roleFilter} label="Filter by Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All Roles</MenuItem>
            {filterableRoles.map(([role, label]) => (
              <MenuItem key={role} value={role}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch} sx={{ height: 40, borderRadius: 2 }}>Search</Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid rgba(8,145,178,0.15)', borderRadius: 3, boxShadow: '0 4px 20px rgba(8,145,178,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(8,145,178,0.04)' }}>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton width={j === 0 ? 140 : 100} height={20} /></TableCell>)}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <People sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.35, mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography variant="body2" color="text.secondary">No users found.</Typography>
                  {creatableRoles.length > 0 && (
                    <Button size="small" startIcon={<Add />} onClick={() => setCreateOpen(true)} sx={{ mt: 1.5 }}>Add first user</Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              users.map((usr) => (
                <TableRow key={usr.id} sx={{ '&:hover': { background: 'rgba(8,145,178,0.03)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={usr.avatar} sx={{ width: 36, height: 36, fontSize: '0.85rem', background: 'linear-gradient(135deg, #0891b2, #a855f7)', fontWeight: 700 }}>
                        {usr.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{usr.name}</Typography>
                        {usr.id === currentUser?.id && <Chip label="You" size="small" sx={{ height: 16, fontSize: '0.6rem', ml: 0.5 }} />}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{usr.email}</TableCell>
                  <TableCell>
                    <Chip label={roleLabels[usr.role] || usr.role} color={roleColors[usr.role] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={usr.isActive ? 'Active' : 'Inactive'}
                      color={usr.isActive ? 'success' : 'error'}
                      size="small" variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                    {new Date(usr.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit Role">
                        <IconButton size="small" onClick={() => { setEditUser(usr); setTargetRole(usr.role); }} disabled={usr.id === currentUser?.id}>
                          <Edit sx={{ fontSize: 17, color: '#0891b2' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={usr.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => handleToggleActive(usr)} disabled={isToggling || usr.id === currentUser?.id}>
                          {usr.isActive
                            ? <ToggleOn sx={{ fontSize: 20, color: '#10b981' }} />
                            : <ToggleOff sx={{ fontSize: 20, color: '#ef4444' }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton size="small" onClick={() => setDeleteTarget(usr)} disabled={usr.id === currentUser?.id || usr.role === 'SUPER_ADMIN'}>
                          <Delete sx={{ fontSize: 17, color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div" count={total} rowsPerPage={rowsPerPage} page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      {/* ── Create User Dialog ─────────────────────────────────── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: { xs: '90vw', sm: 480 } } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, rgba(8,145,178,0.15), rgba(13,148,136,0.15))', display: 'flex' }}>
            <AdminPanelSettings sx={{ color: '#0891b2', fontSize: 22 }} />
          </Box>
          Create New User
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              fullWidth size="small"
              placeholder="e.g. Dr. John Smith"
            />
            <TextField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              fullWidth size="small"
              placeholder="user@institution.edu"
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              fullWidth size="small"
              helperText="Minimum 8 characters"
              InputProps={{
                endAdornment: (
                  <MuiInputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </MuiInputAdornment>
                ),
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
                {creatableRoles.map(role => (
                  <MenuItem key={role} value={role}>{roleLabels[role] || role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={16} color="inherit" /> : <PersonAdd />}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #0891b2, #0d9488)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }}
          >
            {isCreating ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Role Dialog ────────────────────────────────────── */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 340 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User Role</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, p: 1.5, borderRadius: 2, background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.15)' }}>
            <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0891b2, #a855f7)', fontSize: '0.85rem', fontWeight: 700 }}>
              {editUser?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>{editUser?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{editUser?.email}</Typography>
            </Box>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>New Role</InputLabel>
            <Select value={targetRole} label="New Role" onChange={(e) => setTargetRole(e.target.value)}>
              {creatableRoles.map(role => (
                <MenuItem key={role} value={role}>{roleLabels[role] || role}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setEditUser(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" disabled={isUpdating} sx={{ borderRadius: 2 }}>
            {isUpdating ? 'Saving...' : 'Save Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 340 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>Delete User</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>This action cannot be undone. The user will be permanently removed from Firebase and the database.</Alert>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting} sx={{ borderRadius: 2 }}>
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
