'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box, Divider,
  CircularProgress, Avatar, MenuItem,
} from '@mui/material';
import { AccountBalance, Close } from '@mui/icons-material';
import {
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
} from '@/store/slices/instituteSlice';
import { useGetUniversitiesQuery } from '@/store/slices/universitySlice';
import { useAppSelector } from '@/store/store';
import type { Institute } from '@/store/slices/instituteSlice';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  institute?: Institute | null;
  /** Pre-selected universityId (used when creating from University Admin context) */
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

const defaultForm: FormData = {
  name: '', code: '', email: '', phone: '',
  address: '', website: '', description: '', logo: '',
  universityId: '',
};

export default function InstituteFormModal({ open, onClose, institute, universityId: propUniversityId }: Props) {
  const { user } = useAppSelector((s) => s.auth);
  const isEditing = Boolean(institute);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const [createInstitute, { isLoading: isCreating }] = useCreateInstituteMutation();
  const [updateInstitute, { isLoading: isUpdating }] = useUpdateInstituteMutation();
  const isLoading = isCreating || isUpdating;

  const { data: universitiesData } = useGetUniversitiesQuery(
    { limit: 100 },
    { skip: user?.role !== 'SUPER_ADMIN' }
  );

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
    } else {
      setForm({
        ...defaultForm,
        universityId: propUniversityId || '',
      });
    }
    setErrors({});
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

    const payload = {
      ...form,
      universityId: user?.role === 'SUPER_ADMIN' ? form.universityId : undefined,
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
            <Button
              id="close-institute-modal"
              onClick={onClose}
              size="small"
              sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}
            >
              <Close fontSize="small" />
            </Button>
          )}
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(8, 145, 178, 0.15)' }} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {form.name && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                src={form.logo}
                sx={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '1.5rem', fontWeight: 700 }}
              >
                {form.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}

          <Grid container spacing={2.5}>
            {/* University Selection (SUPER_ADMIN only) */}
            {user?.role === 'SUPER_ADMIN' && (
              <Grid item xs={12}>
                <TextField
                  id="inst-universityId"
                  select
                  label="University *"
                  fullWidth
                  value={form.universityId}
                  onChange={handleChange('universityId')}
                  error={Boolean(errors.universityId)}
                  helperText={errors.universityId || 'Select the university this institute belongs to'}
                  disabled={isEditing}
                >
                  <MenuItem value="">
                    <em>-- Select University --</em>
                  </MenuItem>
                  {(universitiesData?.data || []).map((uni) => (
                    <MenuItem key={uni.id} value={uni.id}>
                      {uni.name} ({uni.code})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* Name */}
            <Grid item xs={12}>
              <TextField
                id="inst-name"
                label="Institute Name *"
                fullWidth
                value={form.name}
                onChange={handleChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                placeholder="e.g., Faculty of Engineering"
              />
            </Grid>

            {/* Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="inst-code"
                label="Institute Code *"
                fullWidth
                value={form.code}
                onChange={handleChange('code')}
                error={Boolean(errors.code)}
                helperText={errors.code || 'Short unique code (e.g., ENG, MED)'}
                placeholder="e.g., ENG"
                disabled={isEditing}
                inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="inst-email"
                label="Contact Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
                placeholder="institute@university.edu"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="inst-phone"
                label="Phone Number"
                fullWidth
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="+1 (555) 000-0000"
              />
            </Grid>

            {/* Website */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="inst-website"
                label="Website URL"
                fullWidth
                value={form.website}
                onChange={handleChange('website')}
                error={Boolean(errors.website)}
                helperText={errors.website}
                placeholder="https://institute.edu"
              />
            </Grid>

            {/* Logo URL */}
            <Grid item xs={12}>
              <TextField
                id="inst-logo"
                label="Logo URL"
                fullWidth
                value={form.logo}
                onChange={handleChange('logo')}
                placeholder="https://institute.edu/logo.png"
                helperText="Paste a direct image URL for the institute logo"
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                id="inst-address"
                label="Address"
                fullWidth
                value={form.address}
                onChange={handleChange('address')}
                placeholder="Building A, Main Campus"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                id="inst-description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Brief description of the institute..."
                inputProps={{ maxLength: 500 }}
                helperText={`${form.description.length}/500`}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(8, 145, 178, 0.15)' }} />

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            id="cancel-institute-modal"
            onClick={onClose}
            disabled={isLoading}
            variant="outlined"
            sx={{ borderColor: 'rgba(8, 145, 178, 0.3)' }}
          >
            Cancel
          </Button>
          <Button
            id="submit-institute-btn"
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ minWidth: 140 }}
          >
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Institute')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
