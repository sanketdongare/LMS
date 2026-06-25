'use client';
import { useState, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, InputAdornment, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Skeleton, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import {
  Add, Search, Edit, Delete, MoreVert, School, Refresh, Block,
  CheckCircle, Cancel, FilterList,
} from '@mui/icons-material';
import {
  useGetUniversitiesQuery,
  useDeleteUniversityMutation,
  useDeleteUniversityPermanentMutation,
} from '@/store/slices/universitySlice';
import type { University } from '@/store/slices/universitySlice';
import { useAppSelector } from '@/store/store';
import UniversityFormModal from '@/components/universities/UniversityFormModal';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function UniversitiesPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'DEACTIVATE' | 'DELETE' | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<University | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetUniversitiesQuery({
    page: page + 1,
    limit: rowsPerPage,
    search,
  });

  const [deleteUniversity, { isLoading: isDeleting }] = useDeleteUniversityMutation();
  const [deleteUniversityPermanent, { isLoading: isDeletingPermanent }] = useDeleteUniversityPermanentMutation();

  const universities = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(0);
  }, [searchInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleEdit = (uni: University) => {
    setEditingUniversity(uni);
    setModalOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      if (deleteType === 'DELETE') {
        await deleteUniversityPermanent(deletingId).unwrap();
        toast.success('University permanently deleted successfully');
      } else {
        await deleteUniversity(deletingId).unwrap();
        toast.success('University deactivated successfully');
      }
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setDeleteType(null);
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${deleteType === 'DELETE' ? 'delete' : 'deactivate'} university`);
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, uni: University) => {
    setAnchorEl(e.currentTarget);
    setActiveRow(uni);
  };

  return (
    <Box className="page-content">
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            <span className="gradient-text">Universities</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage all universities in the SDLMS platform
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => refetch()} disabled={isFetching} sx={{ border: '1px solid rgba(8, 145, 178, 0.3)', borderRadius: 2 }}>
                <Refresh sx={{ fontSize: 20, ...(isFetching && { animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }) }} />
              </IconButton>
            </span>
          </Tooltip>
          {user?.role === 'SUPER_ADMIN' && (
            <Button
              id="add-university-btn"
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setEditingUniversity(null); setModalOpen(true); }}
              sx={{ borderRadius: 2 }}
            >
              Add University
            </Button>
          )}
        </Box>
      </Box>

      {/* Search + Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          id="university-search"
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
        <Chip
          label={`Page ${page + 1} of ${Math.ceil(total / rowsPerPage) || 1}`}
          size="small"
          variant="outlined"
        />
        {search && <Chip label={`Search: "${search}"`} size="small" onDelete={() => { setSearch(''); setSearchInput(''); }} color="secondary" />}
      </Box>

      {/* Table */}
      <TableContainer sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>University</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Admin</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Courses</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Added</TableCell>
              {user?.role === 'SUPER_ADMIN' && (
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
            ) : universities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                  <School sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    {search ? `No universities found for "${search}"` : 'No universities yet. Click "Add University" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              universities.map((uni) => (
                <TableRow
                  key={uni.id}
                  className="table-row-hover"
                  sx={{ transition: 'background 0.15s' }}
                >
                  {/* Name */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={uni.logo}
                        sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {uni.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{uni.name}</Typography>
                        {uni.email && <Typography variant="caption" color="text.secondary">{uni.email}</Typography>}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Code */}
                  <TableCell>
                    <Chip label={uni.code} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                  </TableCell>

                  {/* Admin */}
                  <TableCell>
                    {uni.admin ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={uni.admin.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                          {uni.admin.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">{uni.admin.name}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">No admin assigned</Typography>
                    )}
                  </TableCell>

                  {/* Courses */}
                  <TableCell>
                    <Chip label={`${uni._count?.courses ?? 0} courses`} size="small" variant="outlined" />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      icon={uni.isActive ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
                      label={uni.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={uni.isActive ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Added */}
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(uni.createdAt), { addSuffix: true })}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  {user?.role === 'SUPER_ADMIN' && (
                    <TableCell align="right">
                      <IconButton
                        id={`uni-menu-${uni.id}`}
                        size="small"
                        onClick={(e) => openMenu(e, uni)}
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
          {deleteType === 'DELETE' ? '⚠️ Permanently Delete University' : 'Deactivate University'}
        </DialogTitle>
        <DialogContent>
          {deleteType === 'DELETE' ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <strong>This action cannot be undone.</strong> The university, all its courses, and enrollments will be permanently removed from the database.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              This will deactivate the university. All courses and data will be preserved but the university will no longer be visible to users.
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

      {/* Add/Edit University Modal */}
      <UniversityFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingUniversity(null); }}
        university={editingUniversity}
      />
    </Box>
  );
}
