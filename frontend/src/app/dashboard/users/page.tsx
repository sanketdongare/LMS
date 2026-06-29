'use client';
import { useState, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Avatar, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Skeleton, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Button, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Search, Edit, People, Refresh, Cancel, CheckCircle
} from '@mui/icons-material';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '@/store/slices/lmsSlice';
import { useAppSelector } from '@/store/store';
import toast from 'react-hot-toast';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  UNIVERSITY_ADMIN: 'Uni Admin',
  INSTITUTE_ADMIN: 'Inst Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
};

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  SUPER_ADMIN: 'secondary',
  UNIVERSITY_ADMIN: 'primary',
  INSTITUTE_ADMIN: 'warning',
  INSTRUCTOR: 'success',
  STUDENT: 'info',
};

export default function UsersPage() {
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [editUser, setEditUser] = useState<any | null>(null);
  const [targetRole, setTargetRole] = useState('');

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page: page + 1,
    limit: rowsPerPage,
    search,
    role: roleFilter || undefined,
  }, {
    skip: currentUser?.role !== 'SUPER_ADMIN',
  });

  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const users = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(0);
  }, [searchInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleOpenEdit = (user: any) => {
    setEditUser(user);
    setTargetRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editUser || !targetRole) return;
    try {
      await updateUserRole({ id: editUser.id, role: targetRole }).unwrap();
      toast.success('User role updated successfully');
      setEditUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user role');
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <Box className="page-content" sx={{ p: 3 }}>
        <Alert severity="error">Access denied. Only Super Admin can access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box className="page-content">
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            <span className="gradient-text">Users</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage user roles across the platform.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => refetch()} disabled={isFetching} sx={{ border: '1px solid rgba(8, 145, 178, 0.3)', borderRadius: 2 }}>
                <Refresh sx={{ fontSize: 20, ...(isFetching && { animation: 'spin 1s linear infinite', '@keyframes /spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }) }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id="user-search"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{ minWidth: 300, flex: 1, maxWidth: 480 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
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
          <Select
            value={roleFilter}
            label="Filter by Role"
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {Object.entries(roleLabels).map(([role, label]) => (
              <MenuItem key={role} value={role}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSearch} sx={{ height: 40, borderRadius: 2 }}>
          Search
        </Button>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid rgba(8, 145, 178, 0.15)', borderRadius: 3, boxShadow: '0 4px 20px rgba(8, 145, 178, 0.05)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={120} height={20} /></TableCell>
                  <TableCell><Skeleton width={180} height={20} /></TableCell>
                  <TableCell><Skeleton width={80} height={20} /></TableCell>
                  <TableCell><Skeleton width={60} height={20} /></TableCell>
                  <TableCell align="right"><Skeleton width={40} height={20} /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <People sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((usr) => (
                <TableRow key={usr.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={usr.avatar} sx={{ background: 'linear-gradient(135deg, #0891b2, #a855f7)' }}>
                        {usr.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{usr.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{usr.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={roleLabels[usr.role] || usr.role}
                      color={roleColors[usr.role] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={usr.isActive ? 'Active' : 'Inactive'}
                      color={usr.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Role">
                      <IconButton size="small" onClick={() => handleOpenEdit(usr)}>
                        <Edit sx={{ fontSize: 18, color: '#0891b2' }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      {/* Edit Role Dialog */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Modify User Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changing role for: <strong>{editUser?.name}</strong> ({editUser?.email})
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={targetRole}
              label="Select Role"
              onChange={(e) => setTargetRole(e.target.value)}
            >
              {Object.entries(roleLabels).map(([role, label]) => (
                <MenuItem key={role} value={role}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditUser(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" disabled={isUpdating}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
