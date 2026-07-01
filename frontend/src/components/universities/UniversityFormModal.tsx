'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box, Divider,
  CircularProgress, Avatar, Chip, Collapse, Alert,
  MenuItem, InputAdornment, IconButton, Autocomplete,
  Paper, Tabs, Tab,
} from '@mui/material';
import {
  School, Close, AdminPanelSettings, PersonAdd,
  ExpandMore, ExpandLess, Visibility, VisibilityOff,
  PersonSearch,
} from '@mui/icons-material';
import {
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
} from '@/store/slices/universitySlice';
import { useGetUsersQuery, useCreateAdminUserMutation } from '@/store/slices/lmsSlice';
import type { University } from '@/store/slices/universitySlice';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  university?: University | null;
}

interface FormData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  logo: string;
}

interface AdminForm {
  name: string;
  email: string;
  password: string;
}

const defaultForm: FormData = {
  name: '', code: '', email: '', phone: '',
  address: '', website: '', description: '', logo: '',
};

const defaultAdminForm: AdminForm = { name: '', email: '', password: '' };

export default function UniversityFormModal({ open, onClose, university }: Props) {
  const isEditing = Boolean(university);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Admin section state
  const [adminSectionOpen, setAdminSectionOpen] = useState(false);
  const [adminTab, setAdminTab] = useState(0); // 0 = select existing, 1 = create new
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [adminForm, setAdminForm] = useState<AdminForm>(defaultAdminForm);
  const [adminError, setAdminError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminSearchInput, setAdminSearchInput] = useState('');

  const [createUniversity, { isLoading: isCreating }] = useCreateUniversityMutation();
  const [updateUniversity, { isLoading: isUpdating }] = useUpdateUniversityMutation();
  const [createAdminUser, { isLoading: isCreatingAdmin }] = useCreateAdminUserMutation();
  const isLoading = isCreating || isUpdating;

  // Fetch existing university admins for selection
  const { data: usersData } = useGetUsersQuery(
    { limit: 100, role: 'UNIVERSITY_ADMIN', search: adminSearchInput },
    { skip: !adminSectionOpen || adminTab !== 0 }
  );

  const existingAdmins = usersData?.data || [];

  useEffect(() => {
    if (university) {
      setForm({
        name: university.name || '',
        code: university.code || '',
        email: university.email || '',
        phone: university.phone || '',
        address: university.address || '',
        website: university.website || '',
        description: university.description || '',
        logo: university.logo || '',
      });
      setSelectedAdminId(university.adminId || '');
    } else {
      setForm(defaultForm);
      setSelectedAdminId('');
    }
    setErrors({});
    setAdminSectionOpen(false);
    setAdminForm(defaultAdminForm);
    setAdminError('');
    setAdminTab(0);
  }, [university, open]);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'University name is required';
    if (!form.code.trim()) newErrors.code = 'University code is required';
    else if (!/^[A-Za-z0-9-]{2,10}$/.test(form.code.trim())) newErrors.code = 'Code must be 2-10 alphanumeric characters';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (form.website && !/^https?:\/\/.+/.test(form.website)) newErrors.website = 'Website must start with http:// or https://';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setAdminError('');

    // If "Create New Admin" tab is open, create the admin first
    let resolvedAdminId = selectedAdminId;
    if (adminSectionOpen && adminTab === 1) {
      if (!adminForm.name || !adminForm.email || !adminForm.password) {
        setAdminError('Please fill in all admin fields or close the admin section.');
        return;
      }
      if (adminForm.password.length < 8) {
        setAdminError('Admin password must be at least 8 characters.');
        return;
      }
      try {
        const res = await createAdminUser({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
          role: 'UNIVERSITY_ADMIN',
        }).unwrap();
        resolvedAdminId = res.data.id;
        toast.success(`Admin "${adminForm.name}" created!`);
      } catch (err: any) {
        setAdminError(err?.data?.message || 'Failed to create admin user');
        return;
      }
    }

    try {
      const payload = { ...form, ...(resolvedAdminId ? { adminId: resolvedAdminId } : {}) };
      if (isEditing && university) {
        await updateUniversity({ id: university.id, data: payload }).unwrap();
        toast.success(`"${form.name}" updated successfully!`);
      } else {
        await createUniversity(payload).unwrap();
        toast.success(`"${form.name}" created successfully! 🏛️`);
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} university`);
    }
  };

  const currentAdmin = university?.admin;

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          border: '1px solid rgba(8, 145, 178, 0.2)',
          borderRadius: 3,
          boxShadow: '0 16px 48px rgba(8, 145, 178, 0.12)',
        },
      }}
    >
      {/* Title */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex' }}>
              <School sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {isEditing ? 'Edit University' : 'Add New University'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEditing ? `Editing: ${university?.name}` : 'Fill in the details below'}
              </Typography>
            </Box>
          </Box>
          {!isLoading && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(8, 145, 178, 0.15)' }} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Logo preview */}
          {form.name && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar src={form.logo} sx={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '1.5rem', fontWeight: 700 }}>
                {form.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField id="uni-name" label="University Name *" fullWidth value={form.name} onChange={handleChange('name')} error={Boolean(errors.name)} helperText={errors.name} placeholder="e.g., University of Technology" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="uni-code" label="University Code *" fullWidth value={form.code} onChange={handleChange('code')} error={Boolean(errors.code)} helperText={errors.code || 'Unique short code (e.g., UOT)'} placeholder="e.g., UOT" disabled={isEditing} inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="uni-email" label="Contact Email" type="email" fullWidth value={form.email} onChange={handleChange('email')} error={Boolean(errors.email)} helperText={errors.email} placeholder="admin@university.edu" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="uni-phone" label="Phone Number" fullWidth value={form.phone} onChange={handleChange('phone')} placeholder="+1 (555) 000-0000" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="uni-website" label="Website URL" fullWidth value={form.website} onChange={handleChange('website')} error={Boolean(errors.website)} helperText={errors.website} placeholder="https://university.edu" />
            </Grid>
            <Grid item xs={12}>
              <TextField id="uni-logo" label="Logo URL" fullWidth value={form.logo} onChange={handleChange('logo')} placeholder="https://university.edu/logo.png" helperText="Paste a direct image URL for the university logo" />
            </Grid>
            <Grid item xs={12}>
              <TextField id="uni-address" label="Address" fullWidth value={form.address} onChange={handleChange('address')} placeholder="123 University Ave, City, Country" />
            </Grid>
            <Grid item xs={12}>
              <TextField id="uni-description" label="Description" fullWidth multiline rows={3} value={form.description} onChange={handleChange('description')} placeholder="Brief description of the university..." inputProps={{ maxLength: 500 }} helperText={`${form.description.length}/500`} />
            </Grid>
          </Grid>

          {/* ── Admin Assignment Section ── */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Current admin display */}
            {currentAdmin && !adminSectionOpen && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, borderRadius: 2, background: 'rgba(8,145,178,0.05)', border: '1px solid rgba(8,145,178,0.15)' }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', background: 'linear-gradient(135deg, #0891b2, #6366f1)' }}>
                  {currentAdmin.name?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{currentAdmin.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{currentAdmin.email}</Typography>
                </Box>
                <Chip label="Current Admin" size="small" color="primary" />
              </Box>
            )}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<AdminPanelSettings />}
              endIcon={adminSectionOpen ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setAdminSectionOpen(!adminSectionOpen)}
              sx={{
                justifyContent: 'flex-start',
                borderColor: 'rgba(8,145,178,0.3)',
                color: 'primary.main',
                borderRadius: 2,
                py: 1.2,
                '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.04)' },
              }}
            >
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600}>
                  {isEditing ? 'Change University Admin' : 'Assign University Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select existing admin or create a new one
                </Typography>
              </Box>
            </Button>

            <Collapse in={adminSectionOpen}>
              <Paper variant="outlined" sx={{ mt: 2, p: 2.5, borderRadius: 2, borderColor: 'rgba(8,145,178,0.2)', background: 'rgba(8,145,178,0.02)' }}>
                <Tabs value={adminTab} onChange={(_, v) => { setAdminTab(v); setAdminError(''); }} sx={{ mb: 2 }} variant="fullWidth">
                  <Tab icon={<PersonSearch sx={{ fontSize: 18 }} />} iconPosition="start" label="Select Existing" sx={{ fontSize: '0.8rem', minHeight: 40 }} />
                  <Tab icon={<PersonAdd sx={{ fontSize: 18 }} />} iconPosition="start" label="Create New Admin" sx={{ fontSize: '0.8rem', minHeight: 40 }} />
                </Tabs>

                {adminError && <Alert severity="error" sx={{ mb: 2 }}>{adminError}</Alert>}

                {/* Tab 0: Select existing */}
                {adminTab === 0 && (
                  <Box>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select University Admin"
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      helperText="Only users with University Admin role are shown"
                    >
                      <MenuItem value=""><em>-- No admin assigned --</em></MenuItem>
                      {existingAdmins.map((u: any) => (
                        <MenuItem key={u.id} value={u.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>{u.name?.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                    {existingAdmins.length === 0 && (
                      <Alert severity="info" sx={{ mt: 1.5 }}>No University Admins exist yet. Use the "Create New Admin" tab to add one.</Alert>
                    )}
                  </Box>
                )}

                {/* Tab 1: Create new admin */}
                {adminTab === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField size="small" fullWidth label="Admin Full Name *" placeholder="e.g., Dr. Sarah Johnson" value={adminForm.name} onChange={(e) => setAdminForm(f => ({ ...f, name: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField size="small" fullWidth label="Admin Email *" type="email" placeholder="admin@university.edu" value={adminForm.email} onChange={(e) => setAdminForm(f => ({ ...f, email: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        size="small" fullWidth label="Password *"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm(f => ({ ...f, password: e.target.value }))}
                        helperText="The admin will use this password to log in"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<AdminPanelSettings fontSize="small" />}>
                        A <strong>University Admin</strong> account will be created in Firebase and linked to this university.
                      </Alert>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Collapse>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(8, 145, 178, 0.15)' }} />

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button id="cancel-university-modal" onClick={onClose} disabled={isLoading} variant="outlined" sx={{ borderColor: 'rgba(8, 145, 178, 0.3)' }}>
            Cancel
          </Button>
          <Button
            id="submit-university-btn"
            type="submit"
            variant="contained"
            disabled={isLoading || isCreatingAdmin}
            startIcon={(isLoading || isCreatingAdmin) ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ minWidth: 160, background: 'linear-gradient(135deg, #6366f1, #a855f7)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #9333ea)' } }}
          >
            {isLoading || isCreatingAdmin
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Save Changes' : 'Create University')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
