'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetInstitutesQuery, useCreateInstituteMutation } from '@/store/slices/instituteSlice';
import { useGetUniversitiesQuery } from '@/store/slices/universitySlice';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  IconButton, Chip, List, ListItem, ListItemButton, ListItemText,
  Divider, Tab, Tabs, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, InputLabel, FormControl, LinearProgress,
  Paper, Tooltip, Alert, Skeleton
} from '@mui/material';
import {
  Add, Delete, Edit, ChevronRight, School, People, Class,
  Notifications, AssignmentTurnedIn, MenuBook, ArrowBack, Send,
  Poll, BarChart, CheckCircle
} from '@mui/icons-material';
import { useAppSelector } from '@/store/store';
import {
  useGetProgramsQuery,
  useCreateProgramMutation,
  useDeleteProgramMutation,
  useGetBatchesQuery,
  useCreateBatchMutation,
  useDeleteBatchMutation,
  useGetLearnersQuery,
  useGetAvailableLearnersQuery,
  useEnrollLearnerMutation,
  useUnenrollLearnerMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useGetSemestersQuery,
  useCreateSemesterMutation,
  useDeleteSemesterMutation,
  useGetSemesterCoursesQuery,
  useAssignCourseToSemesterMutation,
  useUnassignCourseFromSemesterMutation,
  useGetSurveysQuery,
  useGetSurveyQuery,
  useCreateSurveyMutation,
  useDeleteSurveyMutation,
  useAddQuestionToSurveyMutation,
  useDeleteQuestionMutation,
  useGetBatchAnalyticsQuery
} from '@/store/slices/lmsSlice';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ProgramsAndBatchesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instituteId = searchParams.get('instituteId') || '';
  const { user } = useAppSelector((s) => s.auth);
  const canManage = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role || '');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Modal states
  const [progModalOpen, setProgModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [semModalOpen, setSemModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [annModalOpen, setAnnModalOpen] = useState(false);

  // Forms
  const [progForm, setProgForm] = useState({ name: '', code: '', description: '' });
  const [batchForm, setBatchForm] = useState({ name: '', code: '', description: '', startDate: '', endDate: '' });
  const [semForm, setSemForm] = useState({ name: '', number: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', duration: '', courseId: '' });
  const [surveyForm, setSurveyForm] = useState({ title: '', description: '' });
  const [questionForm, setQuestionForm] = useState({ text: '', type: 'TEXT', options: '' });
  const [enrollSearch, setEnrollSearch] = useState('');
  const [annForm, setAnnForm] = useState({ title: '', content: '' });

  // Selected sub-items
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  // Select/Add Institute inline state
  const [selectedInstId, setSelectedInstId] = useState<string>(instituteId);
  const [showAddInst, setShowAddInst] = useState(false);
  const [instForm, setInstForm] = useState({ name: '', code: '', universityId: '' });

  // Queries
  const { data: programsRes, isLoading: progLoading } = useGetProgramsQuery(
    instituteId ? { instituteId } : undefined
  );
  const programs = programsRes?.data || [];

  const { data: institutesRes } = useGetInstitutesQuery({ limit: 100 });
  const selectedInstitute = (institutesRes?.data || []).find((i) => i.id === (selectedInstId || instituteId));

  const { data: univsRes } = useGetUniversitiesQuery({ limit: 100 });

  const { data: batchesRes, isLoading: batchLoading } = useGetBatchesQuery(selectedProgramId || '', {
    skip: !selectedProgramId,
  });
  const batches = batchesRes?.data || [];

  const activeProgram = programs.find((p) => p.id === selectedProgramId);
  const activeBatch = batches.find((b) => b.id === selectedBatchId);

  // Mutations
  const [createProgram] = useCreateProgramMutation();
  const [deleteProgram] = useDeleteProgramMutation();
  const [createBatch] = useCreateBatchMutation();
  const [deleteBatch] = useDeleteBatchMutation();
  const [createInstitute] = useCreateInstituteMutation();

  const handleCreateProgram = async () => {
    try {
      let finalInstId = selectedInstId || instituteId;

      if (showAddInst) {
        if (!instForm.name || !instForm.code || !instForm.universityId) {
          toast.error('Please fill in all Institute fields (Name, Code, and University)');
          return;
        }
        const newInst = await createInstitute({
          name: instForm.name,
          code: instForm.code,
          universityId: instForm.universityId,
        }).unwrap();
        finalInstId = newInst.data.id;
        toast.success(`Institute "${newInst.data.name}" created successfully!`);
      }

      if (!finalInstId) {
        toast.error('Please select or add an institute');
        return;
      }

      await createProgram({ ...progForm, instituteId: finalInstId }).unwrap();
      toast.success('Program created successfully');
      setProgModalOpen(false);
      setProgForm({ name: '', code: '', description: '' });
      setInstForm({ name: '', code: '', universityId: '' });
      setShowAddInst(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create program');
    }
  };

  const handleDeleteProgram = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this program? All batches under it will be lost.')) return;
    try {
      await deleteProgram(id).unwrap();
      toast.success('Program deleted');
      if (selectedProgramId === id) {
        setSelectedProgramId(null);
        setSelectedBatchId(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete program');
    }
  };

  const handleCreateBatch = async () => {
    try {
      await createBatch({ ...batchForm, programId: selectedProgramId! }).unwrap();
      toast.success('Batch created successfully');
      setBatchModalOpen(false);
      setBatchForm({ name: '', code: '', description: '', startDate: '', endDate: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create batch');
    }
  };

  const handleDeleteBatch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await deleteBatch(id).unwrap();
      toast.success('Batch deleted');
      if (selectedBatchId === id) setSelectedBatchId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete batch');
    }
  };

  return (
    <Box className="page-content" sx={{ color: 'text.primary' }}>
      {selectedBatchId && activeBatch ? (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => {
              setSelectedBatchId(null);
              setActiveTab(0);
            }}
            sx={{ border: '1px solid rgba(8, 145, 178, 0.3)', borderRadius: 2 }}
          >
            <ArrowBack sx={{ color: '#0891b2' }} />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {activeBatch.name}{' '}
              <Chip label={activeBatch.code} size="small" color="primary" sx={{ ml: 1, height: 20 }} />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Program: {activeProgram?.name} · {activeProgram?.code}
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          {/* ── Dashboard Header ── */}
          <Box sx={{ mb: 4 }}>
            {selectedInstitute && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBack />}
                onClick={() => router.push('/dashboard/institutes')}
                sx={{ mb: 2, borderColor: 'rgba(8, 145, 178, 0.3)', borderRadius: 2 }}
              >
                Back to Institutes
              </Button>
            )}
            <Typography variant="h4" fontWeight={700}>
              <span className="gradient-text">
                Programs &amp; Batches {selectedInstitute ? `(${selectedInstitute.name})` : ''}
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Create academic programs and batches, assign semesters, enroll learners, and deploy surveys.
            </Typography>
          </Box>

          {/* ── Stat Cards ── */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, background: 'rgba(255,255,255,0.15)', display: 'flex' }}>
                    <School sx={{ color: 'white', fontSize: 22 }} />
                  </Box>
                  <Box>
                    {progLoading ? (
                      <Skeleton variant="text" width={50} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} color="white">{programs.length}</Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Total Programs</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, background: 'rgba(255,255,255,0.15)', display: 'flex' }}>
                    <Class sx={{ color: 'white', fontSize: 22 }} />
                  </Box>
                  <Box>
                    {progLoading ? (
                      <Skeleton variant="text" width={50} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} color="white">
                        {programs.reduce((sum: number, p: any) => sum + (p._count?.batches ?? 0), 0)}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Total Batches</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, background: 'rgba(255,255,255,0.15)', display: 'flex' }}>
                    <CheckCircle sx={{ color: 'white', fontSize: 22 }} />
                  </Box>
                  <Box>
                    {progLoading ? (
                      <Skeleton variant="text" width={50} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} color="white">
                        {programs.filter((p: any) => p.isActive).length}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Active Programs</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}


      {/* Main Container */}
      {!selectedBatchId ? (
        <Grid container spacing={3}>
          {/* Programs Panel (Left 4 cols) */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)', boxShadow: '0 4px 20px rgba(8, 145, 178, 0.05)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Programs</Typography>
                  {canManage && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => setProgModalOpen(true)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Add
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 1, borderColor: 'rgba(8, 145, 178, 0.15)' }} />

                {progLoading ? (
                  <LinearProgress color="primary" sx={{ mt: 2 }} />
                ) : programs.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Class sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No programs found.</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {programs.map((prog) => (
                      <ListItem
                        key={prog.id}
                        disablePadding
                        secondaryAction={
                          canManage ? (
                            <IconButton edge="end" size="small" onClick={(e) => handleDeleteProgram(prog.id, e)}>
                              <Delete sx={{ fontSize: 18, color: 'error.main' }} />
                            </IconButton>
                          ) : null
                        }
                        sx={{ mb: 0.5 }}
                      >
                        <ListItemButton
                          selected={selectedProgramId === prog.id}
                          onClick={() => {
                            setSelectedProgramId(prog.id);
                            setSelectedBatchId(null);
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            border: '1px solid transparent',
                            '&.Mui-selected': {
                              background: 'rgba(8, 145, 178, 0.08)',
                              borderColor: 'rgba(8, 145, 178, 0.3)',
                              '&:hover': { background: 'rgba(8, 145, 178, 0.12)' },
                              '& .MuiListItemText-primary': { fontWeight: 700, color: '#0891b2' }
                            }
                          }}
                        >
                          <ListItemText
                            primary={prog.name}
                            secondary={`${prog.code} · ${prog._count?.batches || 0} batches`}
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                            secondaryTypographyProps={{ fontSize: '0.75rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Batches Panel (Right 8 cols) */}
          <Grid item xs={12} md={8}>
            {selectedProgramId ? (
              <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)', boxShadow: '0 4px 20px rgba(8, 145, 178, 0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Batches for <span style={{ color: '#0891b2' }}>{activeProgram?.name}</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Select a batch below to manage its courses, surveys, learners, and track analytics.
                      </Typography>
                    </Box>
                    {canManage && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setBatchModalOpen(true)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Add Batch
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 3, borderColor: 'rgba(8, 145, 178, 0.15)' }} />

                  {batchLoading ? (
                    <LinearProgress color="primary" />
                  ) : batches.length === 0 ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                      <School sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>No batches created in this program yet.</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Create a batch to start organizing learners and semesters.</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2.5}>
                      {batches.map((batch) => (
                        <Grid item xs={12} sm={6} key={batch.id}>
                          <Card
                            onClick={() => setSelectedBatchId(batch.id)}
                            className="card-hover"
                            sx={{
                              border: '1px solid rgba(8, 145, 178, 0.15)',
                              cursor: 'pointer',
                              height: '100%',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                background: 'rgba(8, 145, 178, 0.02)'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 2.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                  {batch.name}
                                </Typography>
                                <Chip label={batch.code} size="small" color="secondary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {batch.description || 'No description provided.'}
                              </Typography>
                              <Divider sx={{ my: 1.5, borderColor: 'rgba(8, 145, 178, 0.08)' }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Learners: <strong>{batch._count?.enrollments || 0}</strong> · Semesters: <strong>{batch._count?.semesters || 0}</strong>
                                </Typography>
                                {canManage && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDeleteBatch(batch.id, e)}
                                    sx={{ color: 'error.main', p: 0.5 }}
                                  >
                                    <Delete sx={{ fontSize: 18 }} />
                                  </IconButton>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 12, border: '1px dashed rgba(8, 145, 178, 0.3)', borderRadius: 4, background: 'rgba(8, 145, 178, 0.02)' }}>
                <Class sx={{ fontSize: 60, color: '#0891b2', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" fontWeight={700} color="text.primary">Select a Program</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center', maxWidth: 320 }}>
                  Choose an academic program from the left panel to manage its batches.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      ) : (
        /* Selected Batch Hub Panel with tabs */
        <Box>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              mb: 3,
              borderBottom: '1px solid rgba(8, 145, 178, 0.15)',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
              '& .Mui-selected': { color: '#0891b2' }
            }}
          >
            <Tab icon={<Class sx={{ fontSize: 18 }} />} iconPosition="start" label="Semesters & Courses" />
            <Tab icon={<Poll sx={{ fontSize: 18 }} />} iconPosition="start" label="Surveys" />
            <Tab icon={<People sx={{ fontSize: 18 }} />} iconPosition="start" label="Learners" />
            <Tab icon={<Notifications sx={{ fontSize: 18 }} />} iconPosition="start" label="Announcements" />
            <Tab icon={<BarChart sx={{ fontSize: 18 }} />} iconPosition="start" label="Analytics" />
          </Tabs>

          {/* TAB CONTENT PANELS */}
          {activeTab === 0 && <SemestersTab batchId={selectedBatchId} />}
          {activeTab === 1 && <SurveysTab batchId={selectedBatchId} />}
          {activeTab === 2 && <LearnersTab batchId={selectedBatchId} />}
          {activeTab === 3 && <AnnouncementsTab batchId={selectedBatchId} />}
          {activeTab === 4 && <AnalyticsTab batchId={selectedBatchId} />}
        </Box>
      )}

      {/* Program Create Modal */}
      <Dialog open={progModalOpen} onClose={() => setProgModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3, width: '100%', maxWidth: 460 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Academic Program</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Institute selection/creation */}
            <Grid item xs={12}>
              {!showAddInst ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    select
                    label="Select Institute *"
                    fullWidth
                    value={selectedInstId}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                  >
                    <MenuItem value=""><em>-- Choose Institute --</em></MenuItem>
                    {(institutesRes?.data || []).map((i) => (
                      <MenuItem key={i.id} value={i.id}>
                        {i.name} ({i.code})
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setShowAddInst(true)}
                    sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                  >
                    Add New Institute Inline
                  </Button>
                </Box>
              ) : (
                <Box sx={{ p: 2, border: '1px dashed rgba(8, 145, 178, 0.3)', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary">
                    🆕 Add New Institute
                  </Typography>
                  <TextField
                    label="Institute Name *"
                    size="small"
                    fullWidth
                    value={instForm.name}
                    onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                  />
                  <TextField
                    label="Institute Code *"
                    size="small"
                    fullWidth
                    value={instForm.code}
                    onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                  />
                  <TextField
                    select
                    label="Select University *"
                    size="small"
                    fullWidth
                    value={instForm.universityId}
                    onChange={(e) => setInstForm({ ...instForm, universityId: e.target.value })}
                  >
                    <MenuItem value=""><em>-- Choose University --</em></MenuItem>
                    {(univsRes?.data || []).map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => setShowAddInst(false)}
                    sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                  >
                    Cancel and Select Existing
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField label="Program Name *" fullWidth value={progForm.name} onChange={(e) => setProgForm({ ...progForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Program Code (e.g. BSCS)" fullWidth value={progForm.code} onChange={(e) => setProgForm({ ...progForm, code: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} value={progForm.description} onChange={(e) => setProgForm({ ...progForm, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setProgModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreateProgram} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Batch Create Modal */}
      <Dialog open={batchModalOpen} onClose={() => setBatchModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Batch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Batch Name (e.g. Fall 2026)" fullWidth value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Batch Code (e.g. F26-CS)" fullWidth value={batchForm.code} onChange={(e) => setBatchForm({ ...batchForm, code: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={2} value={batchForm.description} onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={batchForm.startDate} onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={batchForm.endDate} onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setBatchModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreateBatch} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ==========================================
// SUB-TAB COMPONENT: SEMESTERS
// ==========================================
function SemestersTab({ batchId }: { batchId: string }) {
  const { user } = useAppSelector((s) => s.auth);
  const canManage = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role || '');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [semModalOpen, setSemModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const [semForm, setSemForm] = useState({ name: '', number: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', duration: '' });

  const { data: semRes, isLoading: semLoading } = useGetSemestersQuery(batchId);
  const semesters = semRes?.data || [];

  const { data: coursesRes, isLoading: courseLoading } = useGetSemesterCoursesQuery(selectedSemesterId || '', {
    skip: !selectedSemesterId,
  });
  const courses = coursesRes?.data || [];

  const activeSemester = semesters.find((s) => s.id === selectedSemesterId);

  const [createSemester] = useCreateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();
  const [assignCourse] = useAssignCourseToSemesterMutation();
  const [unassignCourse] = useUnassignCourseFromSemesterMutation();

  const handleCreateSem = async () => {
    try {
      await createSemester({ ...semForm, batchId, number: Number(semForm.number) }).unwrap();
      toast.success('Semester created');
      setSemModalOpen(false);
      setSemForm({ name: '', number: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create semester');
    }
  };

  const handleDeleteSem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this semester? All courses inside it will be unassigned.')) return;
    try {
      await deleteSemester(id).unwrap();
      toast.success('Semester deleted');
      if (selectedSemesterId === id) setSelectedSemesterId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete semester');
    }
  };

  const handleCreateCourse = async () => {
    try {
      await assignCourse({ semesterId: selectedSemesterId!, ...courseForm, duration: Number(courseForm.duration) }).unwrap();
      toast.success('Course created and assigned');
      setCourseModalOpen(false);
      setCourseForm({ title: '', description: '', duration: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign course');
    }
  };

  const handleUnassignCourse = async (courseId: string) => {
    if (!window.confirm('Remove this course from the semester?')) return;
    try {
      await unassignCourse({ semesterId: selectedSemesterId!, courseId }).unwrap();
      toast.success('Course removed from semester');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove course');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Left panel: Semesters */}
      <Grid item xs={12} md={4}>
        <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Semesters</Typography>
              {canManage && (
                <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setSemModalOpen(true)}>
                  Add Sem
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {semLoading ? (
              <LinearProgress />
            ) : semesters.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No semesters created.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {semesters.map((sem) => (
                  <ListItem
                    key={sem.id}
                    disablePadding
                    secondaryAction={
                      canManage ? (
                        <IconButton edge="end" size="small" onClick={(e) => handleDeleteSem(sem.id, e)}>
                          <Delete sx={{ fontSize: 18, color: 'error.main' }} />
                        </IconButton>
                      ) : null
                    }
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemButton
                      selected={selectedSemesterId === sem.id}
                      onClick={() => setSelectedSemesterId(sem.id)}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-selected': {
                          background: 'rgba(8, 145, 178, 0.08)',
                          border: '1px solid rgba(8, 145, 178, 0.25)',
                          '& .MuiListItemText-primary': { fontWeight: 700, color: '#0891b2' }
                        }
                      }}
                    >
                      <ListItemText primary={sem.name} secondary={`Semester ${sem.number} · ${sem._count?.courses || 0} courses`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Right panel: Courses in selected Semester */}
      <Grid item xs={12} md={8}>
        {selectedSemesterId ? (
          <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Courses in <span style={{ color: '#0891b2' }}>{activeSemester?.name}</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    View and create courses for this academic semester.
                  </Typography>
                </Box>
                {canManage && (
                  <Button variant="contained" startIcon={<Add />} onClick={() => setCourseModalOpen(true)}>
                    Create Course
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              {courseLoading ? (
                <LinearProgress />
              ) : courses.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <MenuBook sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">No courses assigned to this semester yet.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {courses.map((course) => (
                    <Grid item xs={12} sm={6} key={course.id}>
                      <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.12)', height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700}>{course.title}</Typography>
                            {canManage && (
                              <IconButton size="small" onClick={() => handleUnassignCourse(course.id)} sx={{ color: 'error.main' }}>
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 36, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {course.description || 'No description.'}
                          </Typography>
                          <Chip label={`${course.duration || 'Self'} Hours`} size="small" sx={{ height: 22, fontSize: '0.75rem', background: 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 10, border: '1px dashed rgba(8, 145, 178, 0.25)', borderRadius: 3, background: 'rgba(8, 145, 178, 0.01)' }}>
            <MenuBook sx={{ fontSize: 44, color: '#0891b2', mb: 1, opacity: 0.6 }} />
            <Typography variant="body1" fontWeight={700}>Select a Semester</Typography>
            <Typography variant="body2" color="text.secondary">Choose a semester from the left list to edit courses.</Typography>
          </Box>
        )}
      </Grid>

      {/* Semester Modal */}
      <Dialog open={semModalOpen} onClose={() => setSemModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Semester</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Semester Name (e.g. Semester 1)" fullWidth value={semForm.name} onChange={(e) => setSemForm({ ...semForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Semester Number (e.g. 1)" type="number" fullWidth value={semForm.number} onChange={(e) => setSemForm({ ...semForm, number: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSemModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreateSem} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Course Modal */}
      <Dialog open={courseModalOpen} onClose={() => setCourseModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create & Assign Course</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Course Title" fullWidth value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Duration (Hours)" type="number" fullWidth value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCourseModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreateCourse} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

// ==========================================
// SUB-TAB COMPONENT: SURVEYS
// ==========================================
function SurveysTab({ batchId }: { batchId: string }) {
  const { user } = useAppSelector((s) => s.auth);
  const canManage = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role || '');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  const [surveyForm, setSurveyForm] = useState({ title: '', description: '' });
  const [questionForm, setQuestionForm] = useState({ text: '', type: 'TEXT', options: '' });

  const { data: surveysRes, isLoading: surveysLoading } = useGetSurveysQuery(batchId);
  const surveys = surveysRes?.data || [];

  const { data: surveyRes, isLoading: surveyLoading } = useGetSurveyQuery(selectedSurveyId || '', {
    skip: !selectedSurveyId,
  });
  const surveyDetail = surveyRes?.data;

  const [createSurvey] = useCreateSurveyMutation();
  const [deleteSurvey] = useDeleteSurveyMutation();
  const [addQuestion] = useAddQuestionToSurveyMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const handleCreateSurvey = async () => {
    try {
      await createSurvey({ ...surveyForm, batchId }).unwrap();
      toast.success('Survey created successfully');
      setSurveyModalOpen(false);
      setSurveyForm({ title: '', description: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create survey');
    }
  };

  const handleDeleteSurvey = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this survey and all responses?')) return;
    try {
      await deleteSurvey(id).unwrap();
      toast.success('Survey deleted');
      if (selectedSurveyId === id) setSelectedSurveyId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete survey');
    }
  };

  const handleAddQuestion = async () => {
    try {
      await addQuestion({ surveyId: selectedSurveyId!, ...questionForm }).unwrap();
      toast.success('Question added');
      setQuestionModalOpen(false);
      setQuestionForm({ text: '', type: 'TEXT', options: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion({ surveyId: selectedSurveyId!, questionId }).unwrap();
      toast.success('Question deleted');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete question');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Left panel: Surveys */}
      <Grid item xs={12} md={4}>
        <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Surveys</Typography>
              {canManage && (
                <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setSurveyModalOpen(true)}>
                  Create
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {surveysLoading ? (
              <LinearProgress />
            ) : surveys.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No surveys created yet.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {surveys.map((surv) => (
                  <ListItem
                    key={surv.id}
                    disablePadding
                    secondaryAction={
                      canManage ? (
                        <IconButton edge="end" size="small" onClick={(e) => handleDeleteSurvey(surv.id, e)}>
                          <Delete sx={{ fontSize: 18, color: 'error.main' }} />
                        </IconButton>
                      ) : null
                    }
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemButton
                      selected={selectedSurveyId === surv.id}
                      onClick={() => setSelectedSurveyId(surv.id)}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-selected': {
                          background: 'rgba(8, 145, 178, 0.08)',
                          border: '1px solid rgba(8, 145, 178, 0.25)',
                          '& .MuiListItemText-primary': { fontWeight: 700, color: '#0891b2' }
                        }
                      }}
                    >
                      <ListItemText
                        primary={surv.title}
                        secondary={`Questions: ${surv._count?.questions || 0} · Responses: ${surv._count?.responses || 0}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Right panel: Survey Detail & Question Management */}
      <Grid item xs={12} md={8}>
        {selectedSurveyId ? (
          <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
            {surveyLoading ? (
              <CardContent sx={{ p: 4 }}><LinearProgress /></CardContent>
            ) : surveyDetail ? (
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>{surveyDetail.title}</Typography>
                  {canManage && (
                    <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setQuestionModalOpen(true)}>
                      Add Question
                    </Button>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {surveyDetail.description || 'No description.'}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Questions List */}
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Questions ({surveyDetail.questions?.length || 0})</Typography>
                {surveyDetail.questions?.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'rgba(8, 145, 178, 0.01)', borderRadius: 2, border: '1px dashed rgba(8, 145, 178, 0.15)', mb: 4 }}>
                    <Typography variant="body2" color="text.secondary">No questions added yet. Click "Add Question" to begin.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {surveyDetail.questions?.map((q, idx) => (
                      <Paper key={q.id} variant="outlined" sx={{ p: 2, borderColor: 'rgba(8, 145, 178, 0.12)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight={600}>
                            Q{idx + 1}. {q.text}{' '}
                            {q.isRequired && <span style={{ color: 'red' }}>*</span>}
                          </Typography>
                          {canManage && (
                            <IconButton size="small" onClick={() => handleDeleteQuestion(q.id)} sx={{ color: 'error.main', p: 0.2 }}>
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Type: <strong>{q.type}</strong>
                        </Typography>
                        {q.options && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                            Options: <em>{q.options}</em>
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Student Responses */}
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Submitted Responses ({surveyDetail.responses?.length || 0})</Typography>
                {surveyDetail.responses?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No responses submitted yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {surveyDetail.responses?.map((resp) => (
                      <Paper key={resp.id} sx={{ p: 2, border: '1px solid rgba(8, 145, 178, 0.1)', background: 'rgba(8, 145, 178, 0.01)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', background: '#0891b2' }}>{resp.user?.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{resp.user?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{resp.user?.email} · {formatDistanceToNow(new Date(resp.submittedAt), { addSuffix: true })}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {resp.answers?.map((ans, aIdx) => (
                            <Box key={ans.id} sx={{ pl: 1, borderLeft: '2px solid rgba(8, 145, 178, 0.3)' }}>
                              <Typography variant="caption" fontWeight={600} color="text.secondary">
                                Q: {ans.question?.text}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                A: {ans.answer}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            ) : null}
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 10, border: '1px dashed rgba(8, 145, 178, 0.25)', borderRadius: 3, background: 'rgba(8, 145, 178, 0.01)' }}>
            <Poll sx={{ fontSize: 44, color: '#0891b2', mb: 1, opacity: 0.6 }} />
            <Typography variant="body1" fontWeight={700}>Select a Survey</Typography>
            <Typography variant="body2" color="text.secondary">Choose a survey from the list to view questions and answers.</Typography>
          </Box>
        )}
      </Grid>

      {/* Survey Create Modal */}
      <Dialog open={surveyModalOpen} onClose={() => setSurveyModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Feedback Survey</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Survey Title" fullWidth value={surveyForm.title} onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} value={surveyForm.description} onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSurveyModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreateSurvey} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Question Add Modal */}
      <Dialog open={questionModalOpen} onClose={() => setQuestionModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Survey Question</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Question Text" fullWidth value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Question Type</InputLabel>
                <Select value={questionForm.type} label="Question Type" onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}>
                  <MenuItem value="TEXT">Text Field (Free Input)</MenuItem>
                  <MenuItem value="RATING">Rating (1 to 5 Stars)</MenuItem>
                  <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {questionForm.type === 'MULTIPLE_CHOICE' && (
              <Grid item xs={12}>
                <TextField label="Options (Comma separated)" placeholder="e.g. Yes, No, Maybe" fullWidth value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setQuestionModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddQuestion} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

// ==========================================
// SUB-TAB COMPONENT: LEARNERS (ENROLLMENT)
// ==========================================
function LearnersTab({ batchId }: { batchId: string }) {
  const { user } = useAppSelector((s) => s.auth);
  const canManage = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role || '');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: learnersRes, isLoading: learnersLoading } = useGetLearnersQuery(batchId);
  const enrollments = learnersRes?.data || [];

  const { data: availRes, isLoading: availLoading } = useGetAvailableLearnersQuery({ batchId, search: searchQuery });
  const availableUsers = availRes?.data || [];

  const [enrollLearner] = useEnrollLearnerMutation();
  const [unenrollLearner] = useUnenrollLearnerMutation();

  const handleEnroll = async (userId: string) => {
    try {
      await enrollLearner({ batchId, userId }).unwrap();
      toast.success('Learner enrolled successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to enroll learner');
    }
  };

  const handleUnenroll = async (userId: string) => {
    if (!window.confirm('Remove this student from the batch?')) return;
    try {
      await unenrollLearner({ batchId, userId }).unwrap();
      toast.success('Learner unenrolled successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to unenroll learner');
    }
  };

  return (
    <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Batch Learners</Typography>
            <Typography variant="caption" color="text.secondary">
              List of enrolled learners in this batch. You can register new learners to assign them coursework and surveys.
            </Typography>
          </Box>
          {canManage && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setEnrollModalOpen(true)}>
              Enroll Learner
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {learnersLoading ? (
          <LinearProgress />
        ) : enrollments.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <People sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography variant="body1" color="text.secondary">No students enrolled in this batch yet.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Enrolled Date</TableCell>
                  {canManage && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enr) => (
                  <TableRow key={enr.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ background: '#0891b2' }}>{enr.user?.name?.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{enr.user?.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{enr.user?.email}</TableCell>
                    <TableCell>{new Date(enr.enrolledAt).toLocaleDateString()}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleUnenroll(enr.user.id)} sx={{ color: 'error.main' }}>
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Enroll Learner Modal */}
      <Dialog open={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Enroll Student</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Students"
            placeholder="Search by name or email..."
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ my: 1.5 }}
          />
          {availLoading ? (
            <LinearProgress />
          ) : availableUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No students available to enroll.
            </Typography>
          ) : (
            <List sx={{ maxHeight: 250, overflow: 'auto' }}>
              {availableUsers.map((usr) => (
                <ListItem
                  key={usr.id}
                  secondaryAction={
                    <Button size="small" variant="outlined" onClick={() => handleEnroll(usr.id)}>
                      Enroll
                    </Button>
                  }
                >
                  <ListItemText primary={usr.name} secondary={usr.email} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollModalOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

// ==========================================
// SUB-TAB COMPONENT: ANNOUNCEMENTS
// ==========================================
function AnnouncementsTab({ batchId }: { batchId: string }) {
  const { user } = useAppSelector((s) => s.auth);
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '' });

  const { data: annRes, isLoading: annLoading } = useGetAnnouncementsQuery(batchId);
  const announcements = annRes?.data || [];

  const [createAnnouncement] = useCreateAnnouncementMutation();

  const handlePostAnn = async () => {
    if (!annForm.title || !annForm.content) return;
    try {
      await createAnnouncement({ batchId, ...annForm }).unwrap();
      toast.success('Announcement posted');
      setAnnModalOpen(false);
      setAnnForm({ title: '', content: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to post announcement');
    }
  };

  return (
    <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Batch Announcements</Typography>
            <Typography variant="caption" color="text.secondary">
              Broadcast notes and alerts directly to batch students.
            </Typography>
          </Box>
          {user?.role === 'INSTITUTE_ADMIN' && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setAnnModalOpen(true)}>
              Post Alert
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />

        {annLoading ? (
          <LinearProgress />
        ) : announcements.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Notifications sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography variant="body1" color="text.secondary">No announcements posted yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {announcements.map((ann) => (
              <Paper key={ann.id} variant="outlined" sx={{ p: 2.5, borderColor: 'rgba(8, 145, 178, 0.12)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a">{ann.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {ann.content}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </CardContent>

      {/* Announcement Modal */}
      <Dialog open={annModalOpen} onClose={() => setAnnModalOpen(false)} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Post Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Announcement Title" fullWidth value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Alert Content" fullWidth multiline rows={4} value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAnnModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handlePostAnn} variant="contained" startIcon={<Send />}>Post</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

// ==========================================
// SUB-TAB COMPONENT: BATCH ANALYTICS
// ==========================================
function AnalyticsTab({ batchId }: { batchId: string }) {
  const { data: res, isLoading } = useGetBatchAnalyticsQuery(batchId);
  const stats = res?.data;

  if (isLoading) return <LinearProgress color="primary" />;

  if (!stats) return <Alert severity="warning">Failed to load batch analytics.</Alert>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Metrics Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 3, border: '1px solid rgba(8, 145, 178, 0.15)', background: 'rgba(8, 145, 178, 0.02)', textAlign: 'center' }}>
            <People sx={{ fontSize: 32, color: '#0891b2', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>{stats.enrollmentCount}</Typography>
            <Typography variant="body2" color="text.secondary">Enrolled Learners</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 3, border: '1px solid rgba(8, 145, 178, 0.15)', background: 'rgba(8, 145, 178, 0.02)', textAlign: 'center' }}>
            <Class sx={{ fontSize: 32, color: '#a855f7', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>{stats.semesterCount}</Typography>
            <Typography variant="body2" color="text.secondary">Active Semesters</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 3, border: '1px solid rgba(8, 145, 178, 0.15)', background: 'rgba(8, 145, 178, 0.02)', textAlign: 'center' }}>
            <MenuBook sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>{stats.courseCount}</Typography>
            <Typography variant="body2" color="text.secondary">Total Assigned Courses</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Survey Performance */}
      <Card sx={{ border: '1px solid rgba(8, 145, 178, 0.15)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>Survey Response Performance</Typography>
          {stats.surveyStats.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No surveys deployed for this batch yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {stats.surveyStats.map((srv) => (
                <Box key={srv.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>{srv.title}</Typography>
                    <Typography variant="caption" fontWeight={700} color="#0891b2">
                      {srv.completionRate}% Done ({srv.responses} / {stats.enrollmentCount} learners)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={srv.completionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(8, 145, 178, 0.1)',
                      '& .MuiLinearProgress-bar': { background: '#0891b2' }
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
