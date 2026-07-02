'use client';

import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Skeleton, Alert, Tooltip,
} from '@mui/material';
import {
  Add, Delete, Edit, Article, Visibility, VisibilityOff, Save, CheckCircle,
  ChevronRight, ExpandMore, Search, ArrowBack, ArrowForward, PlayCircleOutline,
  QuizOutlined, ViewSidebar,
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

// Lazy-load LiveEditor
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
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #f0f0f0', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Article sx={{ color: '#0891b2' }} />
          Create New Unit
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Unit Title" fullWidth value={form.title} autoFocus
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Unit 1 - Introduction to Entrepreneurship"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Description (optional)" fullWidth multiline rows={2}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}
          sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #0891b2, #06b6d4)' }}>
          {isLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null} Create Unit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Edit Unit Dialog ───
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
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #f0f0f0', pb: 2 }}>Edit Unit</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Unit Title" fullWidth value={title} onChange={e => setTitle(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Description" fullWidth multiline rows={2} value={desc}
            onChange={e => setDesc(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f0f0f0' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading} sx={{ borderRadius: 2 }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Left Sidebar Unit Tree Item ───
function UnitTreeItem({
  unit, index, isSelected, isExpanded, onSelect, onToggle, canManage
}: {
  unit: CourseUnit;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
  canManage: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteUnit] = useDeleteCourseUnitMutation();
  const [updateUnit] = useUpdateCourseUnitMutation();

  const quizCount = unit.quizzes?.length || 0;
  const hasContent = !!(unit.htmlContent);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${unit.title}"? All content will be lost.`)) return;
    try { await deleteUnit(unit.id).unwrap(); toast.success('Unit deleted'); }
    catch { toast.error('Failed to delete unit'); }
  };

  const handleTogglePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateUnit({ unitId: unit.id, body: { isPublished: !unit.isPublished } }).unwrap();
      toast.success(unit.isPublished ? 'Hidden from students' : 'Published!');
    } catch { toast.error('Failed'); }
  };

  return (
    <>
      {/* Unit row */}
      <Box
        onClick={onSelect}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 1.1,
          cursor: 'pointer',
          borderLeft: isSelected ? '3px solid #8B1A1A' : '3px solid transparent',
          bgcolor: isSelected ? 'rgba(139,26,26,0.06)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
          transition: 'all 0.15s ease',
          userSelect: 'none',
        }}
      >
        {/* Expand/collapse arrow */}
        <Box
          onClick={onToggle}
          sx={{
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', flexShrink: 0,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
          }}
        >
          {isExpanded
            ? <ExpandMore sx={{ fontSize: 16, color: '#666' }} />
            : <ChevronRight sx={{ fontSize: 16, color: '#666' }} />}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? '#8B1A1A' : '#1a1a2e',
              fontSize: '0.82rem',
              lineHeight: 1.35,
              whiteSpace: 'normal',
            }}
          >
            Unit {index + 1} - {unit.title}
          </Typography>
        </Box>

        {/* Admin actions – visible on hover */}
        {canManage && (
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              display: 'flex', gap: 0.2, flexShrink: 0,
              opacity: 0,
              '.unit-tree-item:hover &': { opacity: 1 },
              transition: 'opacity 0.15s',
            }}
          >
            <Tooltip title={unit.isPublished ? 'Hide' : 'Publish'}>
              <IconButton size="small" onClick={handleTogglePublish} sx={{ p: 0.3 }}>
                {unit.isPublished
                  ? <VisibilityOff sx={{ fontSize: 13, color: '#999' }} />
                  : <Visibility sx={{ fontSize: 13, color: '#999' }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={e => { e.stopPropagation(); setEditOpen(true); }} sx={{ p: 0.3 }}>
                <Edit sx={{ fontSize: 13, color: '#999' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={handleDelete} sx={{ p: 0.3 }}>
                <Delete sx={{ fontSize: 13, color: '#ef4444' }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Expanded sub-items (content + quizzes list) */}
      {isExpanded && (
        <Box sx={{ pl: 4, borderLeft: '1px solid #e5e7eb', ml: 2.5 }}>
          {hasContent && (
            <Box
              onClick={onSelect}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                py: 0.6, px: 1, cursor: 'pointer', borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              <Article sx={{ fontSize: 15, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>
                Unit {index + 1}
              </Typography>
            </Box>
          )}
          {unit.quizzes?.map((q, qi) => (
            <Box
              key={q.id}
              onClick={onSelect}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                py: 0.6, px: 1, cursor: 'pointer', borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              <QuizOutlined sx={{ fontSize: 15, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>
                Unit {index + 1} - {q.title}
              </Typography>
            </Box>
          ))}
          {!hasContent && quizCount === 0 && (
            <Typography variant="caption" sx={{ color: '#9ca3af', pl: 1, py: 0.5, display: 'block' }}>
              No content yet
            </Typography>
          )}
        </Box>
      )}

      {editOpen && <EditUnitDialog open unit={unit} onClose={() => setEditOpen(false)} />}
    </>
  );
}

// ─── Unit Content Panel ───
function UnitContentPanel({
  unit, allUnits, selectedIndex, onNavigate, canManage, userId
}: {
  unit: CourseUnit;
  allUnits: CourseUnit[];
  selectedIndex: number;
  onNavigate: (idx: number) => void;
  canManage: boolean;
  userId?: string;
}) {
  const [updateUnit] = useUpdateCourseUnitMutation();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<'content' | 'quiz'>('content');

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
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < allUnits.length - 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Toolbar ── */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 1.2,
          borderBottom: '1px solid #e5e7eb',
          bgcolor: '#fff',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Left: visibility toggle + label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            {unit.isPublished
              ? <Visibility sx={{ fontSize: 16, color: '#6b7280' }} />
              : <VisibilityOff sx={{ fontSize: 16, color: '#9ca3af' }} />}
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              {unit.isPublished ? 'Visible' : 'Hidden'}
            </Typography>
          </Box>
        </Box>

        {/* Right: action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {saving && (
            <Chip icon={<Save sx={{ fontSize: 13 }} />} label="Saving…" size="small"
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }} />
          )}
          {!saving && savedAt && (
            <Chip icon={<CheckCircle sx={{ fontSize: 13 }} />} label="Saved" size="small"
              sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600 }} />
          )}

          {canManage && (
            <>
              <Button
                size="small" variant="outlined"
                sx={{
                  borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                  borderColor: '#d1d5db', color: '#374151',
                  '&:hover': { borderColor: '#0891b2', color: '#0891b2' }
                }}
              >
                Add Existing
              </Button>
              <Button
                size="small" variant="contained"
                onClick={() => setActiveView('content')}
                sx={{
                  borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                  background: '#0891b2',
                  '&:hover': { background: '#0e7490' }
                }}
              >
                Edit Content
              </Button>
            </>
          )}

          {/* Prev / Next navigation */}
          <Tooltip title="Previous Unit">
            <span>
              <IconButton size="small" disabled={!hasPrev} onClick={() => onNavigate(selectedIndex - 1)}
                sx={{ border: '1px solid #e5e7eb', borderRadius: '50%', width: 28, height: 28 }}>
                <ArrowBack sx={{ fontSize: 14 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next Unit">
            <span>
              <IconButton size="small" disabled={!hasNext} onClick={() => onNavigate(selectedIndex + 1)}
                sx={{ border: '1px solid #e5e7eb', borderRadius: '50%', width: 28, height: 28 }}>
                <ArrowForward sx={{ fontSize: 14 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Content Area ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 4 } }}>
        {/* Unit title heading */}
        <Box sx={{ mb: 4, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#111827', mb: 0.5 }}>
            {unit.title}
          </Typography>
          {unit.description && (
            <Typography variant="body2" color="text.secondary">{unit.description}</Typography>
          )}
        </Box>

        {/* Tab switcher: Content | Quizzes */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {[
            { key: 'content', icon: <Article sx={{ fontSize: 15 }} />, label: 'Content' },
            { key: 'quiz', icon: <QuizOutlined sx={{ fontSize: 15 }} />, label: `Quizzes (${quizzes.length})` },
          ].map(tab => (
            <Button
              key={tab.key}
              size="small"
              startIcon={tab.icon}
              onClick={() => setActiveView(tab.key as 'content' | 'quiz')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                px: 2,
                bgcolor: activeView === tab.key ? '#0891b2' : 'transparent',
                color: activeView === tab.key ? '#fff' : '#6b7280',
                border: '1px solid',
                borderColor: activeView === tab.key ? '#0891b2' : '#e5e7eb',
                '&:hover': {
                  bgcolor: activeView === tab.key ? '#0e7490' : 'rgba(8,145,178,0.06)',
                  borderColor: '#0891b2',
                }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Content editor or quiz section */}
        {activeView === 'content' ? (
          <LiveEditor
            unitId={unit.id}
            unitTitle={unit.title}
            initialHtml={unit.htmlContent || ''}
            initialCss={unit.cssContent || ''}
            initialJs={unit.jsContent || ''}
            canEdit={canManage}
            onSave={handleSave}
          />
        ) : (
          <QuizSection unitId={unit.id} quizzes={quizzes} canManage={canManage} userId={userId} />
        )}
      </Box>
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
  const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');

  const selectedIndex = selectedUnitId
    ? units.findIndex(u => u.id === selectedUnitId)
    : 0;
  const selectedUnit = units[selectedIndex] || units[0] || null;

  const filteredUnits = units.filter(u =>
    u.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUnitIds(prev => {
      const next = new Set(prev);
      next.has(unitId) ? next.delete(unitId) : next.add(unitId);
      return next;
    });
  };

  const handleNavigate = (idx: number) => {
    if (units[idx]) setSelectedUnitId(units[idx].id);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: 600, gap: 0 }}>
        <Box sx={{ width: 280, flexShrink: 0, borderRight: '1px solid #e5e7eb', p: 2 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 1.5, mb: 1 }} />)}
        </Box>
        <Box sx={{ flex: 1, p: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (error) return <Alert severity="error">Failed to load units. Please refresh.</Alert>;

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 600, border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden', bgcolor: '#fff' }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      {sidebarOpen && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fafafa',
          }}
        >
          {/* Sidebar header */}
          <Box
            sx={{
              px: 1.5, py: 1.2,
              borderBottom: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>
                {units.length}/{units.length} Units
              </Typography>
            </Box>

            {canManage && (
              <Button
                size="small"
                startIcon={<Add sx={{ fontSize: 14 }} />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
                  color: '#0891b2', minWidth: 'unset', px: 1,
                  '&:hover': { bgcolor: 'rgba(8,145,178,0.08)' }
                }}
              >
                New Unit
              </Button>
            )}
          </Box>

          {/* Search box */}
          <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e5e7eb' }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              border: '1px solid #e5e7eb', borderRadius: 1.5, px: 1.2, py: 0.5,
              bgcolor: '#fff',
            }}>
              <Search sx={{ fontSize: 16, color: '#9ca3af' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search titles, descriptions"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: '0.78rem', color: '#374151', width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
          </Box>

          {/* Unit tree */}
          <Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
            {filteredUnits.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {search ? 'No matching units' : 'No units yet'}
                </Typography>
              </Box>
            ) : (
              filteredUnits.map((unit, idx) => (
                <Box key={unit.id} className="unit-tree-item">
                  <UnitTreeItem
                    unit={unit}
                    index={idx}
                    isSelected={(selectedUnit?.id ?? units[0]?.id) === unit.id}
                    isExpanded={expandedUnitIds.has(unit.id)}
                    onSelect={() => setSelectedUnitId(unit.id)}
                    onToggle={(e) => toggleExpand(unit.id, e)}
                    canManage={canManage}
                  />
                </Box>
              ))
            )}
          </Box>

          {/* New Unit button at bottom */}
          {canManage && units.length > 0 && (
            <Box sx={{ p: 1.5, borderTop: '1px solid #e5e7eb' }}>
              <Button
                fullWidth
                size="small"
                startIcon={<Add sx={{ fontSize: 15 }} />}
                onClick={() => setCreateOpen(true)}
                variant="outlined"
                sx={{
                  borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  borderColor: '#0891b2', color: '#0891b2', fontSize: '0.78rem',
                  '&:hover': { bgcolor: 'rgba(8,145,178,0.06)' }
                }}
              >
                Add Unit
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* ═══ RIGHT CONTENT PANEL ═══ */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Toggle sidebar button */}
        <Box sx={{
          position: 'absolute', left: sidebarOpen ? 280 : 0, top: '50%',
          transform: 'translateY(-50%)', zIndex: 10,
          display: { xs: 'none', md: 'block' },
        }}>
          <Tooltip title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(p => !p)}
              sx={{
                width: 22, height: 40, borderRadius: '0 4px 4px 0',
                bgcolor: '#e5e7eb', border: '1px solid #d1d5db', borderLeft: 'none',
                '&:hover': { bgcolor: '#d1d5db' }
              }}
            >
              <ViewSidebar sx={{ fontSize: 14, color: '#6b7280' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {units.length === 0 ? (
          /* Empty state */
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, py: 10, px: 4 }}>
            <Article sx={{ fontSize: 72, color: '#0891b2', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
              No Units Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3, maxWidth: 360 }}>
              {canManage
                ? 'Create your first unit to start adding content, quizzes, and assessments for students.'
                : 'No units have been published for this course yet.'}
            </Typography>
            {canManage && (
              <Button
                variant="contained" startIcon={<Add />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  borderRadius: 2, textTransform: 'none', fontWeight: 700,
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  px: 3, py: 1.2,
                }}
              >
                Create First Unit
              </Button>
            )}
          </Box>
        ) : selectedUnit ? (
          <UnitContentPanel
            unit={selectedUnit}
            allUnits={units}
            selectedIndex={selectedIndex}
            onNavigate={handleNavigate}
            canManage={canManage}
            userId={userId}
          />
        ) : null}
      </Box>

      <CreateUnitDialog open={createOpen} onClose={() => setCreateOpen(false)} courseId={courseId} />
    </Box>
  );
}
