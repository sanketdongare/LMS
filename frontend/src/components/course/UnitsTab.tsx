'use client';

import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Divider, Skeleton, Alert, Tooltip,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Collapse
} from '@mui/material';
import {
  Add, Delete, Edit, Article, ExpandLess, ExpandMore, DragIndicator,
  Visibility, VisibilityOff, Save, CheckCircle
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

import {
  CourseUnit,
  useGetCourseUnitsQuery,
  useCreateCourseUnitMutation,
  useUpdateCourseUnitMutation,
  useDeleteCourseUnitMutation,
} from '@/store/slices/courseSlice';
import QuizSection from './QuizSection';

// Lazy-load LiveEditor to avoid SSR issues with Monaco
const LiveEditor = dynamic(() => import('./LiveEditor'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <CircularProgress sx={{ color: '#0891b2' }} />
    </Box>
  ),
});

// ─── Create Unit Dialog ───
function CreateUnitDialog({ open, onClose, courseId }: { open: boolean; onClose: () => void; courseId: string }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [createUnit, { isLoading }] = useCreateCourseUnitMutation();

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      await createUnit({ courseId, title: form.title, description: form.description || undefined }).unwrap();
      toast.success('Unit created!');
      setForm({ title: '', description: '' });
      onClose();
    } catch {
      toast.error('Failed to create unit');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Create New Unit</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Unit Title" fullWidth value={form.title} autoFocus onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to HTML" />
          <TextField label="Description (optional)" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null} Create Unit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Edit Unit Title Dialog ───
function EditUnitDialog({ open, unit, onClose }: { open: boolean; unit: CourseUnit; onClose: () => void }) {
  const [title, setTitle] = useState(unit.title);
  const [desc, setDesc] = useState(unit.description || '');
  const [updateUnit, { isLoading }] = useUpdateCourseUnitMutation();

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    try {
      await updateUnit({ unitId: unit.id, body: { title, description: desc } }).unwrap();
      toast.success('Unit updated!');
      onClose();
    } catch {
      toast.error('Failed to update unit');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Unit</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Unit Title" fullWidth value={title} onChange={e => setTitle(e.target.value)} />
          <TextField label="Description" fullWidth multiline rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Unit List Item ───
function UnitListItem({
  unit, isSelected, onSelect, canManage
}: {
  unit: CourseUnit; isSelected: boolean; onSelect: () => void; canManage: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteUnit] = useDeleteCourseUnitMutation();
  const [updateUnit] = useUpdateCourseUnitMutation();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete unit "${unit.title}"? All content and quizzes will be lost.`)) return;
    try {
      await deleteUnit(unit.id).unwrap();
      toast.success('Unit deleted');
    } catch {
      toast.error('Failed to delete unit');
    }
  };

  const handleTogglePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateUnit({ unitId: unit.id, body: { isPublished: !unit.isPublished } }).unwrap();
      toast.success(unit.isPublished ? 'Unit hidden' : 'Unit published!');
    } catch {
      toast.error('Failed');
    }
  };

  const quizCount = unit.quizzes?.length || 0;
  const hasContent = !!(unit.htmlContent || unit.cssContent || unit.jsContent);

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          mb: 0.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: isSelected ? '#0891b2' : 'rgba(8,145,178,0.15)',
          bgcolor: isSelected ? 'rgba(8,145,178,0.08)' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: '#0891b2', bgcolor: 'rgba(8,145,178,0.05)' }
        }}
      >
        <ListItemButton onClick={onSelect} sx={{ borderRadius: 2, py: 1.2 }}>
          {canManage && <DragIndicator sx={{ color: 'text.disabled', mr: 0.5, fontSize: 18 }} />}
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Article sx={{ color: isSelected ? '#0891b2' : 'text.secondary', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight={isSelected ? 700 : 500} sx={{ color: isSelected ? '#0891b2' : 'text.primary' }}>
                {unit.title}
              </Typography>
            }
            secondary={
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.3 }}>
                {hasContent && <Chip label="Content" size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />}
                {quizCount > 0 && <Chip label={`${quizCount} quiz${quizCount > 1 ? 'zes' : ''}`} size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }} />}
                <Chip label={unit.isPublished ? 'Published' : 'Draft'} size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: unit.isPublished ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.05)', color: unit.isPublished ? '#10b981' : 'text.secondary' }} />
              </Box>
            }
          />
          {canManage && (
            <Box sx={{ display: 'flex', gap: 0.3, opacity: 0, '.MuiListItem-root:hover &': { opacity: 1 }, transition: 'opacity 0.2s' }} onClick={e => e.stopPropagation()}>
              <Tooltip title={unit.isPublished ? 'Hide from students' : 'Publish'}>
                <IconButton size="small" onClick={handleTogglePublish}>
                  {unit.isPublished ? <VisibilityOff sx={{ fontSize: 15 }} /> : <Visibility sx={{ fontSize: 15 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit title">
                <IconButton size="small" onClick={e => { e.stopPropagation(); setEditOpen(true); }}>
                  <Edit sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete unit">
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <Delete sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </ListItemButton>
      </ListItem>
      {editOpen && <EditUnitDialog open unit={unit} onClose={() => setEditOpen(false)} />}
    </>
  );
}

// ─── Unit Content Panel ───
function UnitContentPanel({ unit, canManage, userId }: { unit: CourseUnit; canManage: boolean; userId?: string }) {
  const [updateUnit] = useUpdateCourseUnitMutation();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const handleSave = useCallback(async (html: string, css: string, js: string) => {
    setSaving(true);
    try {
      await updateUnit({ unitId: unit.id, body: { htmlContent: html, cssContent: css, jsContent: js } }).unwrap();
      setSavedAt(new Date());
    } catch {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  }, [unit.id, updateUnit]);

  const quizzes = unit.quizzes || [];

  return (
    <Box>
      {/* Unit header */}
      <Box sx={{ mb: 3, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(8,145,178,0.05) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(8,145,178,0.12)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{unit.title}</Typography>
            {unit.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{unit.description}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {saving && <Chip icon={<Save sx={{ fontSize: 14 }} />} label="Saving..." size="small" color="warning" />}
            {!saving && savedAt && <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Saved" size="small" color="success" />}
            <Chip label={unit.isPublished ? 'Published' : 'Draft'} size="small" color={unit.isPublished ? 'success' : 'default'} />
          </Box>
        </Box>
      </Box>

      {/* Live Editor */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          📝 Content Editor
          {!canManage && <Chip label="View Only" size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />}
        </Typography>
        <LiveEditor
          unitId={unit.id}
          unitTitle={unit.title}
          initialHtml={unit.htmlContent || ''}
          initialCss={unit.cssContent || ''}
          initialJs={unit.jsContent || ''}
          canEdit={canManage}
          onSave={handleSave}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Quizzes Section */}
      <QuizSection unitId={unit.id} quizzes={quizzes} canManage={canManage} userId={userId} />
    </Box>
  );
}

// ─── Main UnitsTab ───
interface UnitsTabProps {
  courseId: string;
  canManage: boolean;
  userId?: string;
}

export default function UnitsTab({ courseId, canManage, userId }: UnitsTabProps) {
  const { data, isLoading, error } = useGetCourseUnitsQuery(courseId);
  const units = data?.data || [];
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selectedUnit = units.find(u => u.id === selectedUnitId) || units[0] || null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ width: 280, flexShrink: 0 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1 }} />)}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load units. Please refresh the page.</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Course Units</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Add Unit
          </Button>
        )}
      </Box>

      {/* Empty state */}
      {units.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, border: '2px dashed rgba(8,145,178,0.2)', borderRadius: 3 }}>
          <Article sx={{ fontSize: 64, color: '#0891b2', opacity: 0.4, mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">No Units Yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {canManage ? 'Create your first unit to add content, quizzes, and SAQs.' : 'No units have been published yet.'}
          </Typography>
          {canManage && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
              Create First Unit
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* Left Sidebar: Unit List */}
          <Box sx={{ width: 280, flexShrink: 0, position: 'sticky', top: 80 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {units.length} Unit{units.length !== 1 ? 's' : ''}
            </Typography>
            <List dense disablePadding>
              {units.map(unit => (
                <UnitListItem
                  key={unit.id}
                  unit={unit}
                  isSelected={(selectedUnit?.id ?? units[0]?.id) === unit.id}
                  onSelect={() => setSelectedUnitId(unit.id)}
                  canManage={canManage}
                />
              ))}
            </List>
          </Box>

          {/* Right: Unit Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {selectedUnit ? (
              <UnitContentPanel unit={selectedUnit} canManage={canManage} userId={userId} />
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Select a unit to view its content</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <CreateUnitDialog open={createOpen} onClose={() => setCreateOpen(false)} courseId={courseId} />
    </Box>
  );
}
