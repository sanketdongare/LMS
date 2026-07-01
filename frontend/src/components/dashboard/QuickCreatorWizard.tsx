'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, Divider
} from '@mui/material';
import {
  School, Class, MenuBook, Article, AssignmentTurnedIn, Add
} from '@mui/icons-material';
import { useAppSelector } from '@/store/store';
import { useGetInstitutesQuery } from '@/store/slices/instituteSlice';
import {
  useGetProgramsQuery,
  useGetBatchesQuery,
  useGetSemestersQuery,
  useCreateProgramMutation,
  useCreateBatchMutation,
  useCreateSemesterMutation,
  useAssignCourseToSemesterMutation,
} from '@/store/slices/lmsSlice';
import {
  useGetCoursesQuery,
  useGetCourseUnitsQuery,
  useCreateCourseUnitMutation,
  useCreateQuizMutation
} from '@/store/slices/courseSlice';
import toast from 'react-hot-toast';

export default function QuickCreatorWizard() {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role || '');

  const [activeModal, setActiveModal] = useState<string | null>(null); // 'program' | 'batch' | 'semester' | 'course' | 'unit' | 'quiz'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parent selections for dependent dropdowns
  const [selectedInstId, setSelectedInstId] = useState('');
  const [selectedProgId, setSelectedProgId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSemId, setSelectedSemId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  // Form states
  const [progForm, setProgForm] = useState({ name: '', code: '', description: '' });
  const [batchForm, setBatchForm] = useState({ name: '', code: '', description: '', startDate: '', endDate: '' });
  const [semForm, setSemForm] = useState({ name: '', number: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', duration: '' });
  const [unitForm, setUnitForm] = useState({ title: '', description: '' });
  const [quizForm, setQuizForm] = useState({ title: '', description: '', timeLimit: '', maxAttempts: '' });

  // Query Hooks
  const { data: instsRes } = useGetInstitutesQuery({ limit: 100 }, { skip: !activeModal });
  const { data: progsRes } = useGetProgramsQuery(undefined, { skip: !activeModal });
  const { data: batchesRes } = useGetBatchesQuery(selectedProgId, { skip: !selectedProgId });
  const { data: semsRes } = useGetSemestersQuery(selectedBatchId, { skip: !selectedBatchId });
  const { data: coursesRes } = useGetCoursesQuery(undefined, { skip: !activeModal });
  const { data: unitsRes } = useGetCourseUnitsQuery(selectedCourseId, { skip: !selectedCourseId });

  // Mutation Hooks
  const [createProgram] = useCreateProgramMutation();
  const [createBatch] = useCreateBatchMutation();
  const [createSemester] = useCreateSemesterMutation();
  const [assignCourse] = useAssignCourseToSemesterMutation();
  const [createUnit] = useCreateCourseUnitMutation();
  const [createQuiz] = useCreateQuizMutation();

  if (!isAdmin) return null;

  const handleClose = () => {
    setActiveModal(null);
    setError('');
    setSelectedInstId('');
    setSelectedProgId('');
    setSelectedBatchId('');
    setSelectedSemId('');
    setSelectedCourseId('');
    setSelectedUnitId('');
    setProgForm({ name: '', code: '', description: '' });
    setBatchForm({ name: '', code: '', description: '', startDate: '', endDate: '' });
    setSemForm({ name: '', number: '' });
    setCourseForm({ title: '', description: '', duration: '' });
    setUnitForm({ title: '', description: '' });
    setQuizForm({ title: '', description: '', timeLimit: '', maxAttempts: '' });
  };

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      if (activeModal === 'program') {
        if (!progForm.name || !progForm.code) throw new Error('Name and Code are required');
        await createProgram({ ...progForm, instituteId: selectedInstId || undefined }).unwrap();
        toast.success('Program created successfully! 🎓');
      } else if (activeModal === 'batch') {
        if (!selectedProgId) throw new Error('Program selection is required');
        if (!batchForm.name || !batchForm.code) throw new Error('Name and Code are required');
        await createBatch({ ...batchForm, programId: selectedProgId }).unwrap();
        toast.success('Batch created successfully! 📅');
      } else if (activeModal === 'semester') {
        if (!selectedBatchId) throw new Error('Batch selection is required');
        if (!semForm.name || !semForm.number) throw new Error('Name and Number are required');
        await createSemester({ ...semForm, batchId: selectedBatchId, number: Number(semForm.number) }).unwrap();
        toast.success('Semester created successfully! 🏛️');
      } else if (activeModal === 'course') {
        if (!selectedSemId) throw new Error('Semester selection is required');
        if (!courseForm.title) throw new Error('Course Title is required');
        await assignCourse({
          semesterId: selectedSemId,
          title: courseForm.title,
          description: courseForm.description,
          duration: courseForm.duration ? Number(courseForm.duration) : undefined
        }).unwrap();
        toast.success('Course created and assigned successfully! 📚');
      } else if (activeModal === 'unit') {
        if (!selectedCourseId) throw new Error('Course selection is required');
        if (!unitForm.title) throw new Error('Unit Title is required');
        await createUnit({ courseId: selectedCourseId, ...unitForm }).unwrap();
        toast.success('Course Unit created successfully! 📄');
      } else if (activeModal === 'quiz') {
        if (!selectedUnitId) throw new Error('Unit selection is required');
        if (!quizForm.title) throw new Error('Quiz Title is required');
        await createQuiz({
          unitId: selectedUnitId,
          title: quizForm.title,
          description: quizForm.description || undefined,
          timeLimit: quizForm.timeLimit ? Number(quizForm.timeLimit) : undefined,
          maxAttempts: quizForm.maxAttempts ? Number(quizForm.maxAttempts) : undefined,
        }).unwrap();
        toast.success('Quiz section created successfully! 📝');
      }
      handleClose();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const wizards = [
    { key: 'program', label: 'Program', icon: <School />, color: '#6366f1' },
    { key: 'batch', label: 'Batch', icon: <Class />, color: '#a855f7' },
    { key: 'semester', label: 'Semester', icon: <Class />, color: '#06b6d4' },
    { key: 'course', label: 'Course', icon: <MenuBook />, color: '#10b981' },
    { key: 'unit', label: 'Course Unit', icon: <Article />, color: '#f59e0b' },
    { key: 'quiz', label: 'Quiz Section', icon: <AssignmentTurnedIn />, color: '#ec4899' },
  ];

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid rgba(8, 145, 178, 0.15)', mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>⚡ Quick Creator Wizard</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
          Create academic entities instantly anywhere in the hierarchy
        </Typography>

        <Grid container spacing={2}>
          {wizards.map((w) => (
            <Grid item xs={6} sm={4} md={2} key={w.key}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setActiveModal(w.key)}
                startIcon={w.icon}
                sx={{
                  flexDirection: 'column',
                  gap: 1,
                  py: 2.5,
                  borderRadius: 3,
                  borderColor: `${w.color}30`,
                  color: 'text.primary',
                  '& .MuiButton-startIcon': { m: 0, color: w.color },
                  '&:hover': {
                    borderColor: w.color,
                    background: `${w.color}08`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {w.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Wizard Dialogs */}
        <Dialog open={Boolean(activeModal)} onClose={handleClose} PaperProps={{ sx: { background: '#ffffff', borderRadius: 3, width: '100%', maxWidth: 440 } }}>
          <DialogTitle sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
            Create New {activeModal}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* 1. Program form */}
            {activeModal === 'program' && (
              <>
                {user?.role === 'SUPER_ADMIN' && (
                  <TextField select size="small" label="Select Institute" value={selectedInstId} onChange={(e) => setSelectedInstId(e.target.value)} fullWidth>
                    <MenuItem value=""><em>-- None (Optional) --</em></MenuItem>
                    {(instsRes?.data || []).map((i) => (
                      <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField size="small" label="Program Name *" value={progForm.name} onChange={(e) => setProgForm({ ...progForm, name: e.target.value })} fullWidth placeholder="e.g. Bachelor of Science" />
                <TextField size="small" label="Program Code *" value={progForm.code} onChange={(e) => setProgForm({ ...progForm, code: e.target.value })} fullWidth placeholder="e.g. BSCS" />
                <TextField size="small" label="Description" value={progForm.description} onChange={(e) => setProgForm({ ...progForm, description: e.target.value })} fullWidth multiline rows={2} />
              </>
            )}

            {/* 2. Batch form */}
            {activeModal === 'batch' && (
              <>
                <TextField select size="small" label="Select Program *" value={selectedProgId} onChange={(e) => setSelectedProgId(e.target.value)} fullWidth>
                  <MenuItem value=""><em>-- Choose Program --</em></MenuItem>
                  {(progsRes?.data || []).map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name} ({p.code})</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="Batch Name *" value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} fullWidth placeholder="e.g. Fall 2026" />
                <TextField size="small" label="Batch Code *" value={batchForm.code} onChange={(e) => setBatchForm({ ...batchForm, code: e.target.value })} fullWidth placeholder="e.g. F26-CS" />
                <TextField size="small" label="Description" value={batchForm.description} onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })} fullWidth multiline rows={2} />
              </>
            )}

            {/* 3. Semester form */}
            {activeModal === 'semester' && (
              <>
                <TextField select size="small" label="Select Program *" value={selectedProgId} onChange={(e) => { setSelectedProgId(e.target.value); setSelectedBatchId(''); }} fullWidth>
                  <MenuItem value=""><em>-- Choose Program --</em></MenuItem>
                  {(progsRes?.data || []).map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </TextField>
                <TextField select size="small" label="Select Batch *" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} disabled={!selectedProgId} fullWidth>
                  <MenuItem value=""><em>-- Choose Batch --</em></MenuItem>
                  {(batchesRes?.data || []).map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="Semester Name *" value={semForm.name} onChange={(e) => setSemForm({ ...semForm, name: e.target.value })} fullWidth placeholder="e.g. Semester 1" />
                <TextField size="small" label="Semester Number (integer) *" type="number" value={semForm.number} onChange={(e) => setSemForm({ ...semForm, number: e.target.value })} fullWidth placeholder="e.g. 1" />
              </>
            )}

            {/* 4. Course form */}
            {activeModal === 'course' && (
              <>
                <TextField select size="small" label="Select Program *" value={selectedProgId} onChange={(e) => { setSelectedProgId(e.target.value); setSelectedBatchId(''); setSelectedSemId(''); }} fullWidth>
                  <MenuItem value=""><em>-- Choose Program --</em></MenuItem>
                  {(progsRes?.data || []).map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </TextField>
                <TextField select size="small" label="Select Batch *" value={selectedBatchId} onChange={(e) => { setSelectedBatchId(e.target.value); setSelectedSemId(''); }} disabled={!selectedProgId} fullWidth>
                  <MenuItem value=""><em>-- Choose Batch --</em></MenuItem>
                  {(batchesRes?.data || []).map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </TextField>
                <TextField select size="small" label="Select Semester *" value={selectedSemId} onChange={(e) => setSelectedSemId(e.target.value)} disabled={!selectedBatchId} fullWidth>
                  <MenuItem value=""><em>-- Choose Semester --</em></MenuItem>
                  {(semsRes?.data || []).map((s: any) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="Course Title *" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} fullWidth placeholder="e.g. Intro to Programming" />
                <TextField size="small" label="Course Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} fullWidth multiline rows={2} />
                <TextField size="small" label="Duration (hours)" type="number" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} fullWidth />
              </>
            )}

            {/* 5. Unit form */}
            {activeModal === 'unit' && (
              <>
                <TextField select size="small" label="Select Course *" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} fullWidth>
                  <MenuItem value=""><em>-- Choose Course --</em></MenuItem>
                  {(coursesRes?.data || []).map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="Unit Title *" value={unitForm.title} onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })} fullWidth placeholder="e.g. Unit 1: Fundamentals" />
                <TextField size="small" label="Description" value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} fullWidth multiline rows={2} />
              </>
            )}

            {/* 6. Quiz form */}
            {activeModal === 'quiz' && (
              <>
                <TextField select size="small" label="Select Course *" value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedUnitId(''); }} fullWidth>
                  <MenuItem value=""><em>-- Choose Course --</em></MenuItem>
                  {(coursesRes?.data || []).map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                  ))}
                </TextField>
                <TextField select size="small" label="Select Unit *" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} disabled={!selectedCourseId} fullWidth>
                  <MenuItem value=""><em>-- Choose Unit --</em></MenuItem>
                  {(unitsRes?.data || []).map((u: any) => (
                    <MenuItem key={u.id} value={u.id}>{u.title}</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="Quiz Title *" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} fullWidth placeholder="e.g. Midterm Quiz" />
                <TextField size="small" label="Description" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} fullWidth multiline rows={2} />
                <TextField size="small" label="Time Limit (minutes)" type="number" value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })} fullWidth />
                <TextField size="small" label="Max Attempts" type="number" value={quizForm.maxAttempts} onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: e.target.value })} fullWidth />
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} disabled={loading} variant="outlined">Cancel</Button>
            <Button onClick={handleCreate} disabled={loading} variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Add />}>
              Create {activeModal}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
