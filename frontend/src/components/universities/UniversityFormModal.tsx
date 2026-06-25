'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box, Divider,
  CircularProgress, Avatar, Chip,
} from '@mui/material';
import { School, Close } from '@mui/icons-material';
import {
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
} from '@/store/slices/universitySlice';
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

const defaultForm: FormData = {
  name: '', code: '', email: '', phone: '',
  address: '', website: '', description: '', logo: '',
};

export default function UniversityFormModal({ open, onClose, university }: Props) {
  const isEditing = Boolean(university);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const [createUniversity, { isLoading: isCreating }] = useCreateUniversityMutation();
  const [updateUniversity, { isLoading: isUpdating }] = useUpdateUniversityMutation();
  const isLoading = isCreating || isUpdating;

  // Populate form when editing
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
    } else {
      setForm(defaultForm);
    }
    setErrors({});
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

    try {
      if (isEditing && university) {
        await updateUniversity({ id: university.id, data: form }).unwrap();
        toast.success(`"${form.name}" updated successfully!`);
      } else {
        await createUniversity(form).unwrap();
        toast.success(`"${form.name}" created successfully! 🏛️`);
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} university`);
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
            <Button
              id="close-university-modal"
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
          {/* Logo preview */}
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
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                id="uni-name"
                label="University Name *"
                fullWidth
                value={form.name}
                onChange={handleChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                placeholder="e.g., University of Technology"
              />
            </Grid>

            {/* Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="uni-code"
                label="University Code *"
                fullWidth
                value={form.code}
                onChange={handleChange('code')}
                error={Boolean(errors.code)}
                helperText={errors.code || 'Unique short code (e.g., UOT, MIT)'}
                placeholder="e.g., UOT"
                disabled={isEditing} // Code shouldn't change after creation
                inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="uni-email"
                label="Contact Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
                placeholder="admin@university.edu"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                id="uni-phone"
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
                id="uni-website"
                label="Website URL"
                fullWidth
                value={form.website}
                onChange={handleChange('website')}
                error={Boolean(errors.website)}
                helperText={errors.website}
                placeholder="https://university.edu"
              />
            </Grid>

            {/* Logo URL */}
            <Grid item xs={12}>
              <TextField
                id="uni-logo"
                label="Logo URL"
                fullWidth
                value={form.logo}
                onChange={handleChange('logo')}
                placeholder="https://university.edu/logo.png"
                helperText="Paste a direct image URL for the university logo"
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                id="uni-address"
                label="Address"
                fullWidth
                value={form.address}
                onChange={handleChange('address')}
                placeholder="123 University Ave, City, Country"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                id="uni-description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Brief description of the university..."
                inputProps={{ maxLength: 500 }}
                helperText={`${form.description.length}/500`}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(8, 145, 178, 0.15)' }} />

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            id="cancel-university-modal"
            onClick={onClose}
            disabled={isLoading}
            variant="outlined"
            sx={{ borderColor: 'rgba(8, 145, 178, 0.3)' }}
          >
            Cancel
          </Button>
          <Button
            id="submit-university-btn"
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ minWidth: 140 }}
          >
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create University')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
