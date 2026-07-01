'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box, Divider,
  CircularProgress, Avatar, MenuItem, Collapse, Alert,
  InputAdornment, IconButton, Paper, Tabs, Tab,
} from '@mui/material';
import { AccountBalance, Close, AdminPanelSettings, PersonAdd, ExpandMore, ExpandLess, Visibility, VisibilityOff, PersonSearch } from '@mui/icons-material';
import {
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
} from '@/store/slices/instituteSlice';
import { useGetUniversitiesQuery } from '@/store/slices/universitySlice';
import { useGetUsersQuery, useCreateAdminUserMutation } from '@/store/slices/lmsSlice';
import { useAppSelector } from '@/store/store';
import type { Institute } from '@/store/slices/instituteSlice';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  institute?: Institute | null;
  universityId?: string;
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
  universityId: string;
}

interface AdminForm {
  name: string;
  email: string;
}

const defaultForm: FormData = {
  name: '', code: '', email: '', phone: '',
  address: '', website: '', description: '', logo: '',
  universityId: '',
};
const defaultAdminForm: AdminForm = { name: '', email: '' };

export default function InstituteFormModal({ open, onClose, institute, universityId: propUniversityId }: Props) {
  const { user } = useAppSelector((s) => s.auth);
  const isEditing = Boolean(institute);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Admin section state
  const [adminSectionOpen, setAdminSectionOpen] = useState(false);
  const [adminTab, setAdminTab] = useState(0);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [adminForm, setAdminForm] = useState<AdminForm>(defaultAdminForm);
  const [adminError, setAdminError] = useState('');

  const [createInstitute, { isLoading: isCreating }] = useCreateInstituteMutation();
  const [updateInstitute, { isLoading: isUpdating }] = useUpdateInstituteMutation();
  const [createAdminUser, { isLoading: isCreatingAdmin }] = useCreateAdminUserMutation();
  const isLoading = isCreating || isUpdating;

  const { data: universitiesData } = useGetUniversitiesQuery(
    { limit: 100 },
    { skip: user?.role !== 'SUPER_ADMIN' }
  );

  // Fetch existing institute admins
  const { data: adminsData } = useGetUsersQuery(
    { limit: 100, role: 'INSTITUTE_ADMIN' },
    { skip: !adminSectionOpen || adminTab !== 0 }
  );
  const existingAdmins = adminsData?.data || [];

  useEffect(() => {
    if (institute) {
      setForm({
        name: institute.name || '',
        code: institute.code || '',
        email: institute.email || '',
        phone: institute.phone || '',
        address: institute.address || '',
        website: institute.website || '',
        description: institute.description || '',
        logo: institute.logo || '',
        universityId: institute.universityId || '',
      });
      setSelectedAdminId((institute as any).adminId || '');
    } else {
      setForm({ ...defaultForm, universityId: propUniversityId || '' });
      setSelectedAdminId('');
    }
    setErrors({});
    setAdminSectionOpen(false);
    setAdminForm(defaultAdminForm);
    setAdminError('');
    setAdminTab(0);
  }, [institute, open, propUniversityId]);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'Institute name is required';
    if (!form.code.trim()) newErrors.code = 'Institute code is required';
    else if (!/^[A-Za-z0-9-]{2,10}$/.test(form.code.trim())) newErrors.code = 'Code must be 2–10 alphanumeric characters';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (form.website && !/^https?:\/\/.+/.test(form.website)) newErrors.website = 'Website must start with http:// or https://';
    if (user?.role === 'SUPER_ADMIN' && !form.universityId) newErrors.universityId = 'University selection is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setAdminError('');

    let resolvedAdminId = selectedAdminId;

    // Create new admin if "Create New Admin" tab is active
    if (adminSectionOpen && adminTab === 1) {
      if (!adminForm.name || !adminForm.email) {
        setAdminError('Please fill all admin fields or close the admin section.');
        return;
      }
      try {
        const res = await createAdminUser({
          name: adminForm.name,
          email: adminForm.email,
          role: 'INSTITUTE_ADMIN',
        }).unwrap();
        resolvedAdminId = res.data.id;
        toast.success(`Admin "${adminForm.name}" created!`);
      } catch (err: any) {
        setAdminError(err?.data?.message || 'Failed to create admin user');
        return;
      }
    }

    const payload = {
      ...form,
      universityId: user?.role === 'SUPER_ADMIN' ? form.universityId : undefined,
      ...(resolvedAdminId ? { adminId: resolvedAdminId } : {}),
    };

    try {
      if (isEditing && institute) {
        await updateInstitute({ id: institute.id, data: payload }).unwrap();
        toast.success(`"${form.name}" updated successfully!`);
      } else {
        await createInstitute(payload).unwrap();
        toast.success(`"${form.name}" institute created successfully! 🏛️`);
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} institute`);
    }
  };

  const currentAdmin = (institute as any)?.admin;

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { background: '#ffffff', border: '1px solid rgba(8,145,178,0.2)', borderRadius: 3, boxShadow: '0 16px 48px rgba(8,145,178,0.12)' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #0d9488)', display: 'flex' }}>
              <AccountBalance sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {isEditing ? 'Edit Institute' : 'Add New Institute'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isEditing ? `Editing: ${institute?.name}` : 'Fill in the details below'}
              </Typography>
            </Box>
          </Box>
          {!isLoading && (
            <IconButton id="close-institute-modal" onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(8,145,178,0.15)' }} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
          {form.name && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar src={form.logo} sx={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0891b2, #0d9488)', fontSize: '1.5rem', fontWeight: 700 }}>
                {form.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}

          <Grid container spacing={2.5}>
            {/* University Selection (SUPER_ADMIN only) */}
            {user?.role === 'SUPER_ADMIN' && (
              <Grid item xs={12}>
                <TextField
                  id="inst-universityId" select label="University *" fullWidth
                  value={form.universityId} onChange={handleChange('universityId')}
                  error={Boolean(errors.universityId)} helperText={errors.universityId || 'Select the university this institute belongs to'}
                  disabled={isEditing}
                >
                  <MenuItem value=""><em>-- Select University --</em></MenuItem>
                  {(universitiesData?.data || []).map((uni) => (
                    <MenuItem key={uni.id} value={uni.id}>{uni.name} ({uni.code})</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField id="inst-name" label="Institute Name *" fullWidth value={form.name} onChange={handleChange('name')} error={Boolean(errors.name)} helperText={errors.name} placeholder="e.g., Faculty of Engineering" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="inst-code" label="Institute Code *" fullWidth value={form.code} onChange={handleChange('code')} error={Boolean(errors.code)} helperText={errors.code || 'Short unique code (e.g., ENG, MED)'} placeholder="e.g., ENG" disabled={isEditing} inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="inst-email" label="Contact Email" type="email" fullWidth value={form.email} onChange={handleChange('email')} error={Boolean(errors.email)} helperText={errors.email} placeholder="institute@university.edu" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="inst-phone" label="Phone Number" fullWidth value={form.phone} onChange={handleChange('phone')} placeholder="+1 (555) 000-0000" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField id="inst-website" label="Website URL" fullWidth value={form.website} onChange={handleChange('website')} error={Boolean(errors.website)} helperText={errors.website} placeholder="https://institute.edu" />
            </Grid>
            <Grid item xs={12}>
              <TextField id="inst-logo" label="Logo URL" fullWidth value={form.logo} onChange={handleChange('logo')} placeholder="https://institute.edu/logo.png" helperText="Paste a direct image URL for the institute logo" />
            </Grid>
            <Grid item xs={12}>
              <TextField id="inst-address" label="Address" fullWidth value={form.address} onChange={handleChange('address')} placeholder="Building A, Main Campus" />
            </Grid>
            <Grid item xs={12}>
              <TextField id="inst-description" label="Description" fullWidth multiline rows={3} value={form.description} onChange={handleChange('description')} placeholder="Brief description of the institute..." inputProps={{ maxLength: 500 }} helperText={`${form.description.length}/500`} />
            </Grid>
          </Grid>

          {/* ── Admin Assignment Section ── */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Current admin */}
            {currentAdmin && !adminSectionOpen && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, borderRadius: 2, background: 'rgba(8,145,178,0.05)', border: '1px solid rgba(8,145,178,0.15)' }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', background: 'linear-gradient(135deg, #0891b2, #0d9488)' }}>
                  {currentAdmin.name?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{currentAdmin.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{currentAdmin.email}</Typography>
                </Box>
                <Box sx={{ px: 1, py: 0.3, borderRadius: 1, background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)' }}>
                  <Typography variant="caption" color="primary" fontWeight={700}>Current Admin</Typography>
                </Box>
              </Box>
            )}

            <Button
              fullWidth variant="outlined"
              startIcon={<AdminPanelSettings />}
              endIcon={adminSectionOpen ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setAdminSectionOpen(!adminSectionOpen)}
              sx={{
                justifyContent: 'flex-start', borderColor: 'rgba(8,145,178,0.3)',
                color: 'primary.main', borderRadius: 2, py: 1.2,
                '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.04)' },
              }}
            >
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600}>
                  {isEditing ? 'Change Institute Admin' : 'Assign Institute Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select an existing admin or create a new one
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

                {adminTab === 0 && (
                  <Box>
                    <TextField
                      select fullWidth size="small" label="Select Institute Admin"
                      value={selectedAdminId} onChange={(e) => setSelectedAdminId(e.target.value)}
                      helperText="Only users with Institute Admin role are shown"
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
                      <Alert severity="info" sx={{ mt: 1.5 }}>No Institute Admins exist yet. Use the "Create New Admin" tab to add one.</Alert>
                    )}
                  </Box>
                )}

                {adminTab === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField size="small" fullWidth label="Admin Full Name *" placeholder="e.g., Prof. David Lee" value={adminForm.name} onChange={(e) => setAdminForm(f => ({ ...f, name: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField size="small" fullWidth label="Admin Email *" type="email" placeholder="admin@institute.edu" value={adminForm.email} onChange={(e) => setAdminForm(f => ({ ...f, email: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<AdminPanelSettings fontSize="small" />}>
                        An <strong>Institute Admin</strong> account will be created. A secure temporary password will be automatically generated and emailed to the admin containing their credentials.
                      </Alert>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Collapse>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(8,145,178,0.15)' }} />

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button id="cancel-institute-modal" onClick={onClose} disabled={isLoading} variant="outlined" sx={{ borderColor: 'rgba(8,145,178,0.3)' }}>
            Cancel
          </Button>
          <Button
            id="submit-institute-btn"
            type="submit"
            variant="contained"
            disabled={isLoading || isCreatingAdmin}
            startIcon={(isLoading || isCreatingAdmin) ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ minWidth: 160, background: 'linear-gradient(135deg, #0891b2, #0d9488)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }}
          >
            {isLoading || isCreatingAdmin
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Save Changes' : 'Create Institute')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
