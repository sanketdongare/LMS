'use client';
import { useState, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, InputAdornment, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Skeleton, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Grid, Card, CardContent,
} from '@mui/material';
import {
  Add, Search, Edit, Delete, MoreVert, AccountBalance, Refresh, Block,
  CheckCircle, Cancel, PowerSettingsNew, School,
} from '@mui/icons-material';
import {
  useGetInstitutesQuery,
  useDeleteInstituteMutation,
  useDeleteInstitutePermanentMutation,
} from '@/store/slices/instituteSlice';
import type { Institute } from '@/store/slices/instituteSlice';
import { useAppSelector } from '@/store/store';
import InstituteFormModal from '@/components/institutes/InstituteFormModal';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Mini stat card for dashboard overview
function StatCard({ label, value, icon, gradient, loading }: {
  label: string; value: string | number; icon: React.ReactNode; gradient: string; loading?: boolean;
}) {
  return (
    <Card sx={{ borderRadius: 3, background: gradient, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
        <Box sx={{ p: 1.2, borderRadius: 2, background: 'rgba(255,255,255,0.15)', display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          {loading ? (
            <Skeleton variant="text" width={50} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          ) : (
            <Typography variant="h5" fontWeight={800} color="white">{value}</Typography>
          )}
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function InstitutesPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'DEACTIVATE' | 'DELETE' | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<Institute | null>(null);

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'UNIVERSITY_ADMIN';

  const { data, isLoading, isFetching, refetch } = useGetInstitutesQuery({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const [deleteInstitute, { isLoading: isDeleting }] = useDeleteInstituteMutation();
  const [deleteInstitutePermanent, { isLoading: isDeletingPermanent }] = useDeleteInstitutePermanentMutation();

  const institutes = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(0);
  }, [searchInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleEdit = (inst: Institute) => {
    setEditingInstitute(inst);
    setModalOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      if (deleteType === 'DELETE') {
        await deleteInstitutePermanent(deletingId).unwrap();
        toast.success('Institute permanently deleted successfully');
      } else {
        await deleteInstitute(deletingId).unwrap();
        toast.success('Institute deactivated successfully');
      }
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setDeleteType(null);
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${deleteType === 'DELETE' ? 'delete' : 'deactivate'} institute`);
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, inst: Institute) => {
    setAnchorEl(e.currentTarget);
    setActiveRow(inst);
  };

  const activeCount = institutes.filter((i) => i.isActive).length;
  const uniqueUniversities = new Set(institutes.map((i) => i.universityId)).size;

  return (
    <Box className="page-content">
      {/* ── Dashboard Header ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          <span className="gradient-text">Institutes</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {user?.role === 'UNIVERSITY_ADMIN'
            ? 'Manage institutes within your university'
            : 'Manage all institutes across universities'}
        </Typography>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Institutes"
            value={total}
            icon={<AccountBalance sx={{ color: 'white', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active"
            value={institutes.filter(i => i.isActive).length}
            icon={<CheckCircle sx={{ color: 'white', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Inactive"
            value={institutes.filter(i => !i.isActive).length}
            icon={<PowerSettingsNew sx={{ color: 'white', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Universities"
            value={uniqueUniversities}
            icon={<School sx={{ color: 'white', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* ── Page Actions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={600}>All Institutes</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => refetch()} disabled={isFetching} sx={{ border: '1px solid rgba(8, 145, 178, 0.3)', borderRadius: 2 }}>
                <Refresh sx={{ fontSize: 20, ...(isFetching && { animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }) }} />
              </IconButton>
            </span>
          </Tooltip>
          {canManage && (
            <Button
              id="add-institute-btn"
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setEditingInstitute(null); setModalOpen(true); }}
              sx={{ borderRadius: 2 }}
            >
              Add Institute
            </Button>
          )}
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          id="institute-search"
          placeholder="Search by name, code, or email..."
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
        <Button variant="outlined" onClick={handleSearch} sx={{ borderColor: 'rgba(8, 145, 178, 0.4)', minWidth: 100 }}>
          Search
        </Button>
      </Box>

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`Total: ${total}`} size="small" variant="outlined" color="primary" />
        <Chip label={`Page ${page + 1} of ${Math.ceil(total / rowsPerPage) || 1}`} size="small" variant="outlined" />
        {search && <Chip label={`Search: "${search}"`} size="small" onDelete={() => { setSearch(''); setSearchInput(''); }} color="secondary" />}
      </Box>

      {/* Table */}
      <TableContainer sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Institute</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>University</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Admin</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Added</TableCell>
              {canManage && (
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }} align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : institutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                  <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    {search ? `No institutes found for "${search}"` : 'No institutes yet. Click "Add Institute" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              institutes.map((inst) => (
                <TableRow
                  key={inst.id}
                  className="table-row-hover"
                  sx={{ transition: 'background 0.15s' }}
                >
                  {/* Name */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={inst.logo}
                        sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {inst.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{inst.name}</Typography>
                        {inst.email && <Typography variant="caption" color="text.secondary">{inst.email}</Typography>}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Code */}
                  <TableCell>
                    <Chip label={inst.code} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                  </TableCell>

                  {/* University */}
                  <TableCell>
                    {inst.university ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={inst.university.logo} sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                          {inst.university.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">{inst.university.name}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>

                  {/* Admin */}
                  <TableCell>
                    {inst.admin ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={inst.admin.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                          {inst.admin.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">{inst.admin.name}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">No admin assigned</Typography>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      icon={inst.isActive ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
                      label={inst.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={inst.isActive ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Added */}
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(inst.createdAt), { addSuffix: true })}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  {canManage && (
                    <TableCell align="right">
                      <IconButton
                        id={`inst-menu-${inst.id}`}
                        size="small"
                        onClick={(e) => openMenu(e, inst)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ color: 'text.secondary' }}
      />

      {/* Row Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { background: '#ffffff', border: '1px solid rgba(8, 145, 178, 0.2)', borderRadius: 2, minWidth: 180, boxShadow: '0 8px 24px rgba(8, 145, 178, 0.12)' } }}
      >
        <MenuItem onClick={() => activeRow && handleEdit(activeRow)} sx={{ gap: 1.5 }}>
          <Edit fontSize="small" color="primary" /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeRow) {
              setDeletingId(activeRow.id);
              setDeleteType('DEACTIVATE');
              setDeleteDialogOpen(true);
              setAnchorEl(null);
            }
          }}
          sx={{ gap: 1.5, color: 'warning.main' }}
        >
          <Block fontSize="small" /> Deactivate
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeRow) {
              setDeletingId(activeRow.id);
              setDeleteType('DELETE');
              setDeleteDialogOpen(true);
              setAnchorEl(null);
            }
          }}
          sx={{ gap: 1.5, color: 'error.main' }}
        >
          <Delete fontSize="small" /> Delete Permanently
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !(isDeleting || isDeletingPermanent) && (setDeleteDialogOpen(false), setDeleteType(null))}
        PaperProps={{ sx: { background: '#ffffff', border: '1px solid rgba(8, 145, 178, 0.2)', borderRadius: 3, maxWidth: 440 } }}
      >
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
          {deleteType === 'DELETE' ? '⚠️ Permanently Delete Institute' : 'Deactivate Institute'}
        </DialogTitle>
        <DialogContent>
          {deleteType === 'DELETE' ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <strong>This action cannot be undone.</strong> The institute will be permanently removed from the database.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              This will deactivate the institute. All data will be preserved but the institute will no longer be visible to users.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => { setDeleteDialogOpen(false); setDeleteType(null); }}
            disabled={isDeleting || isDeletingPermanent}
            variant="outlined"
            sx={{ borderColor: 'rgba(8, 145, 178, 0.3)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting || isDeletingPermanent}
            variant="contained"
            color="error"
            sx={{ background: deleteType === 'DELETE' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {isDeleting || isDeletingPermanent
              ? deleteType === 'DELETE' ? 'Deleting...' : 'Deactivating...'
              : deleteType === 'DELETE' ? 'Delete Permanently' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Institute Modal */}
      <InstituteFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingInstitute(null); }}
        institute={editingInstitute}
      />
    </Box>
  );
}
