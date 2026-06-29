'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  IconButton, Chip, List, ListItem, ListItemButton, ListItemText,
  Divider, Tab, Tabs, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Paper, Alert, Skeleton, Switch,
  FormControlLabel, Collapse
} from '@mui/material';
import {
  Add, Delete, ArrowBack, Send, School, People, MenuBook,
  Notifications, AssignmentTurnedIn, Forum, Poll, SmartToy,
  BarChart, ExpandMore, ExpandLess, Grade,
  TrendingUp, EmojiEvents, AccessTime, Description, Article
} from '@mui/icons-material';
import { useAppSelector } from '@/store/store';
import {
  useGetCourseByIdQuery,
  useGetOutcomesQuery,
  useCreateOutcomeMutation,
  useDeleteOutcomeMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useGetTopicsQuery,
  useCreateTopicMutation,
  useGetTopicPostsQuery,
  useCreatePostMutation,
  useGetAgentQuery,
  useUpdateAgentMutation,
  useChatWithAgentMutation,
  useGetCourseAnalyticsQuery,
} from '@/store/slices/courseSlice';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import dynamic from 'next/dynamic';

const UnitsTab = dynamic(() => import('@/components/course/UnitsTab'), { ssr: false });

/* ─── Shared Constants ─── */
const CARD_BORDER = '1px solid rgba(8, 145, 178, 0.15)';
const CARD_SHADOW = '0 4px 20px rgba(8, 145, 178, 0.05)';
const TEAL = '#0891b2';
const DIVIDER_COLOR = 'rgba(8, 145, 178, 0.15)';

/* ========================================================================== */
/*  MAIN PAGE COMPONENT                                                       */
/* ========================================================================== */
export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { user } = useAppSelector((s) => s.auth);
  const canManage = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR'].includes(
    user?.role || ''
  );

  const [activeTab, setActiveTab] = useState(0);

  const {
    data: courseRes,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const course = courseRes?.data;

  /* ── Loading skeleton ── */
  if (courseLoading) {
    return (
      <Box className="page-content" sx={{ color: 'text.primary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={36} />
            <Skeleton variant="text" width="25%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  /* ── Error state ── */
  if (courseError || !course) {
    return (
      <Box className="page-content" sx={{ color: 'text.primary' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load course details. The course may not exist or you lack permissions.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/courses')}
        >
          Back to Courses
        </Button>
      </Box>
    );
  }

  /* ── Page render ── */
  return (
    <Box className="page-content" sx={{ color: 'text.primary' }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <IconButton
          onClick={() => router.push('/dashboard/courses')}
          sx={{ border: '1px solid rgba(8, 145, 178, 0.3)', borderRadius: 2, mt: 0.5 }}
        >
          <ArrowBack sx={{ color: TEAL }} />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" fontWeight={700}>
              <span className="gradient-text">{course.title}</span>
            </Typography>
            <Chip
              label={course.isPublished ? 'Published' : 'Draft'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                background: course.isPublished
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
                color: course.isPublished ? '#059669' : '#d97706',
                border: `1px solid ${
                  course.isPublished ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'
                }`,
              }}
            />
            <Chip
              label={course.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                background: course.isActive
                  ? 'rgba(8, 145, 178, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                color: course.isActive ? TEAL : '#ef4444',
                border: `1px solid ${
                  course.isActive ? 'rgba(8,145,178,0.25)' : 'rgba(239,68,68,0.25)'
                }`,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {course.instructor?.name && (
              <>
                Instructor: <strong>{course.instructor.name}</strong> ·{' '}
              </>
            )}
            {course.description || 'No description provided.'}
          </Typography>
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: `1px solid ${DIVIDER_COLOR}`,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            minHeight: 48,
          },
          '& .Mui-selected': { color: TEAL },
          '& .MuiTabs-indicator': { backgroundColor: TEAL },
        }}
      >
        <Tab icon={<MenuBook sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" />
        <Tab icon={<Article sx={{ fontSize: 18 }} />} iconPosition="start" label="Units & Content" />
        <Tab
          icon={<Notifications sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Announcements"
        />
        <Tab
          icon={<AssignmentTurnedIn sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Assignments"
        />
        <Tab icon={<Forum sx={{ fontSize: 18 }} />} iconPosition="start" label="Discussions" />
        <Tab icon={<Poll sx={{ fontSize: 18 }} />} iconPosition="start" label="Surveys" />
        <Tab icon={<SmartToy sx={{ fontSize: 18 }} />} iconPosition="start" label="AI Agent" />
        <Tab icon={<BarChart sx={{ fontSize: 18 }} />} iconPosition="start" label="Analytics" />
      </Tabs>

      {/* ── Tab Panels ── */}
      {activeTab === 0 && (
        <OverviewTab courseId={courseId} course={course} canManage={canManage} />
      )}
      {activeTab === 1 && <UnitsTab courseId={courseId} canManage={canManage} userId={user?.id} />}
      {activeTab === 2 && <AnnouncementsTab courseId={courseId} canManage={canManage} />}
      {activeTab === 3 && <AssignmentsTab courseId={courseId} canManage={canManage} />}
      {activeTab === 4 && <DiscussionsTab courseId={courseId} />}
      {activeTab === 5 && <SurveysTab />}
      {activeTab === 6 && <AgentTab courseId={courseId} canManage={canManage} />}
      {activeTab === 7 && <AnalyticsTab courseId={courseId} />}
    </Box>
  );
}

/* ========================================================================== */
/*  TAB 1 – OVERVIEW + LEARNING OUTCOMES                                      */
/* ========================================================================== */
function OverviewTab({
  courseId,
  course,
  canManage,
}: {
  courseId: string;
  course: any;
  canManage: boolean;
}) {
  const [outcomeText, setOutcomeText] = useState('');

  const { data: outcomesRes, isLoading: outcomesLoading } = useGetOutcomesQuery(courseId);
  const outcomes = outcomesRes?.data || [];

  const [createOutcome, { isLoading: creating }] = useCreateOutcomeMutation();
  const [deleteOutcome] = useDeleteOutcomeMutation();

  const handleAddOutcome = async () => {
    if (!outcomeText.trim()) return;
    try {
      await createOutcome({ id: courseId, description: outcomeText.trim() }).unwrap();
      toast.success('Outcome added');
      setOutcomeText('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add outcome');
    }
  };

  const handleDeleteOutcome = async (outcomeId: string) => {
    if (!window.confirm('Delete this learning outcome?')) return;
    try {
      await deleteOutcome({ courseId, outcomeId }).unwrap();
      toast.success('Outcome removed');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete outcome');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* ── Course Info ── */}
      <Grid item xs={12} md={5}>
        <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW, height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Course Information
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: DIVIDER_COLOR }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <InfoRow label="Title" value={course.title} />
              <InfoRow
                label="Description"
                value={course.description || 'No description provided.'}
                multiline
              />

              {course.instructor && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Instructor
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: TEAL,
                        fontSize: '0.85rem',
                      }}
                    >
                      {course.instructor.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {course.instructor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.instructor.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {course.duration && (
                <InfoRow label="Duration" value={`${course.duration} hours`} />
              )}

              <InfoRow
                label="Created"
                value={new Date(course.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <StatusChip
                    label={course.isPublished ? 'Published' : 'Draft'}
                    active={course.isPublished}
                    activeColor="#059669"
                    activeBg="rgba(16,185,129,0.1)"
                    inactiveColor="#d97706"
                    inactiveBg="rgba(245,158,11,0.1)"
                  />
                  <StatusChip
                    label={course.isActive ? 'Active' : 'Inactive'}
                    active={course.isActive}
                    activeColor={TEAL}
                    activeBg="rgba(8,145,178,0.1)"
                    inactiveColor="#ef4444"
                    inactiveBg="rgba(239,68,68,0.1)"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Learning Outcomes ── */}
      <Grid item xs={12} md={7}>
        <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW, height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Learning Outcomes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Define what students will achieve by completing this course.
                </Typography>
              </Box>
              <Chip
                label={`${outcomes.length} outcomes`}
                size="small"
                sx={{
                  bgcolor: 'rgba(8,145,178,0.08)',
                  color: TEAL,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: DIVIDER_COLOR }} />

            {/* Add form */}
            {canManage && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g. Students will be able to design REST APIs..."
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': { borderColor: TEAL },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddOutcome}
                  disabled={creating || !outcomeText.trim()}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    minWidth: 100,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add
                </Button>
              </Box>
            )}

            {/* List */}
            {outcomesLoading ? (
              <LinearProgress color="primary" />
            ) : outcomes.length === 0 ? (
              <EmptyState icon={School} message="No learning outcomes defined yet." />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {outcomes.map((oc, idx) => (
                  <Paper
                    key={oc.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: 'rgba(8,145,178,0.12)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'rgba(8,145,178,0.3)',
                        background: 'rgba(8,145,178,0.02)',
                      },
                    }}
                  >
                    <NumberBadge num={idx + 1} />
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, lineHeight: 1.6, pt: 0.3 }}
                    >
                      {oc.description}
                    </Typography>
                    {canManage && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOutcome(oc.id)}
                        sx={{ color: 'error.main', p: 0.5 }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

/* ========================================================================== */
/*  TAB 2 – ANNOUNCEMENTS                                                     */
/* ========================================================================== */
function AnnouncementsTab({
  courseId,
  canManage,
}: {
  courseId: string;
  canManage: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const { data: annRes, isLoading } = useGetAnnouncementsQuery(courseId);
  const announcements = annRes?.data || [];

  const [createAnnouncement, { isLoading: posting }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    try {
      await createAnnouncement({
        id: courseId,
        title: form.title.trim(),
        content: form.content.trim(),
      }).unwrap();
      toast.success('Announcement posted');
      setModalOpen(false);
      setForm({ title: '', content: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (annId: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement({ courseId, annId }).unwrap();
      toast.success('Announcement deleted');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
      <CardContent sx={{ p: 3 }}>
        <SectionHeader
          title="Course Announcements"
          subtitle="Broadcast important updates, deadlines, and notices to all enrolled students."
          action={
            canManage ? (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setModalOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Post Announcement
              </Button>
            ) : undefined
          }
        />

        {isLoading ? (
          <LinearProgress color="primary" />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Notifications}
            message="No announcements posted yet."
            hint={canManage ? 'Click "Post Announcement" to share updates with your students.' : undefined}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {announcements.map((ann) => (
              <Paper
                key={ann.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderColor: 'rgba(8,145,178,0.12)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'rgba(8,145,178,0.3)' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: TEAL,
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                      {ann.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
                    </Typography>
                    {canManage && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(ann.id)}
                        sx={{ color: 'error.main', p: 0.3 }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ whiteSpace: 'pre-wrap', pl: 2 }}
                >
                  {ann.content}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </CardContent>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Post Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            variant="contained"
            disabled={posting}
            startIcon={<Send />}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

/* ========================================================================== */
/*  TAB 3 – ASSIGNMENTS & RUBRICS                                             */
/* ========================================================================== */
function AssignmentsTab({
  courseId,
  canManage,
}: {
  courseId: string;
  canManage: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRubric, setExpandedRubric] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: '',
    rubricCriteriaJson: '',
  });

  const { data: asnRes, isLoading } = useGetAssignmentsQuery(courseId);
  const assignments = asnRes?.data || [];

  const [createAssignment, { isLoading: creating }] = useCreateAssignmentMutation();

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const body: Record<string, unknown> = { title: form.title.trim() };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.dueDate) body.dueDate = form.dueDate;
      if (form.points) body.points = Number(form.points);
      if (form.rubricCriteriaJson.trim())
        body.rubricCriteriaJson = form.rubricCriteriaJson.trim();

      await createAssignment({ id: courseId, body: body as any }).unwrap();
      toast.success('Assignment created');
      setModalOpen(false);
      setForm({ title: '', description: '', dueDate: '', points: '', rubricCriteriaJson: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create assignment');
    }
  };

  const parseRubric = (json: string) => {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  return (
    <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
      <CardContent sx={{ p: 3 }}>
        <SectionHeader
          title="Assignments & Rubrics"
          subtitle="Create assignments, set due dates, and define grading rubrics for your course."
          action={
            canManage ? (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setModalOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Create Assignment
              </Button>
            ) : undefined
          }
        />

        {isLoading ? (
          <LinearProgress color="primary" />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={AssignmentTurnedIn}
            message="No assignments yet."
            hint={canManage ? 'Create your first assignment to start evaluating students.' : undefined}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assignments.map((asn) => {
              const rubricData = asn.rubric?.criteriaJson
                ? parseRubric(asn.rubric.criteriaJson)
                : null;
              const isExpanded = expandedRubric === asn.id;

              return (
                <Paper
                  key={asn.id}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(8,145,178,0.12)',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'rgba(8,145,178,0.3)' },
                  }}
                >
                  {/* Assignment header */}
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                      {asn.title}
                    </Typography>
                    {asn.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {asn.description}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      {asn.dueDate && (
                        <Chip
                          icon={<AccessTime sx={{ fontSize: 14 }} />}
                          label={`Due: ${new Date(asn.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}`}
                          size="small"
                          sx={{
                            fontSize: '0.72rem',
                            height: 24,
                            bgcolor: 'rgba(245,158,11,0.08)',
                            color: '#d97706',
                          }}
                        />
                      )}
                      {asn.points != null && (
                        <Chip
                          icon={<Grade sx={{ fontSize: 14 }} />}
                          label={`${asn.points} points`}
                          size="small"
                          sx={{
                            fontSize: '0.72rem',
                            height: 24,
                            bgcolor: 'rgba(99,102,241,0.08)',
                            color: '#6366f1',
                          }}
                        />
                      )}
                      <Chip
                        icon={<Description sx={{ fontSize: 14 }} />}
                        label={`${asn._count?.submissions || 0} submissions`}
                        size="small"
                        sx={{
                          fontSize: '0.72rem',
                          height: 24,
                          bgcolor: 'rgba(8,145,178,0.08)',
                          color: TEAL,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Created{' '}
                        {formatDistanceToNow(new Date(asn.createdAt), { addSuffix: true })}
                      </Typography>

                      {rubricData && (
                        <Button
                          size="small"
                          onClick={() => setExpandedRubric(isExpanded ? null : asn.id)}
                          endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                          sx={{
                            ml: 'auto',
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            color: TEAL,
                          }}
                        >
                          {isExpanded ? 'Hide Rubric' : 'View Rubric'}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Expanded rubric */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                      <Divider sx={{ mb: 2, borderColor: 'rgba(8,145,178,0.12)' }} />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ mb: 1.5, color: TEAL }}
                      >
                        Grading Rubric
                      </Typography>

                      {Array.isArray(rubricData) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {rubricData.map((c: any, i: number) => (
                            <Paper
                              key={i}
                              sx={{
                                p: 1.5,
                                bgcolor: 'rgba(8,145,178,0.02)',
                                border: '1px solid rgba(8,145,178,0.08)',
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                {c.name || c.criteria || `Criterion ${i + 1}`}
                              </Typography>
                              {c.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {c.description}
                                </Typography>
                              )}
                              {c.points != null && (
                                <Chip
                                  label={`${c.points} pts`}
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: 'rgba(99,102,241,0.1)',
                                    color: '#6366f1',
                                  }}
                                />
                              )}
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(8,145,178,0.02)',
                            border: '1px solid rgba(8,145,178,0.08)',
                          }}
                        >
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                            }}
                          >
                            {JSON.stringify(rubricData, null, 2)}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        )}
      </CardContent>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Assignment Title"
                fullWidth
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Total Points"
                type="number"
                fullWidth
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Rubric Criteria (JSON, optional)"
                fullWidth
                multiline
                rows={4}
                placeholder={
                  '[\n  { "name": "Clarity", "points": 25, "description": "..." },\n  { "name": "Accuracy", "points": 25 }\n]'
                }
                value={form.rubricCriteriaJson}
                onChange={(e) => setForm({ ...form, rubricCriteriaJson: e.target.value })}
                sx={{ '& textarea': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

/* ========================================================================== */
/*  TAB 4 – DISCUSSIONS                                                       */
/* ========================================================================== */
function DiscussionsTab({ courseId }: { courseId: string }) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', content: '' });
  const [replyText, setReplyText] = useState('');

  const { data: topicsRes, isLoading: topicsLoading } = useGetTopicsQuery(courseId);
  const topics = topicsRes?.data || [];

  const { data: postsRes, isLoading: postsLoading } = useGetTopicPostsQuery(
    { courseId, topicId: selectedTopicId || '' },
    { skip: !selectedTopicId }
  );
  const posts = postsRes?.data || [];

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const [createTopic, { isLoading: creatingTopic }] = useCreateTopicMutation();
  const [createPost, { isLoading: creatingPost }] = useCreatePostMutation();

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim() || !topicForm.content.trim()) return;
    try {
      await createTopic({
        id: courseId,
        title: topicForm.title.trim(),
        content: topicForm.content.trim(),
      }).unwrap();
      toast.success('Discussion topic created');
      setTopicModalOpen(false);
      setTopicForm({ title: '', content: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create topic');
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !selectedTopicId) return;
    try {
      await createPost({
        courseId,
        topicId: selectedTopicId,
        content: replyText.trim(),
      }).unwrap();
      toast.success('Reply posted');
      setReplyText('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to post reply');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Left – Topics list */}
      <Grid item xs={12} md={4}>
        <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Topics
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => setTopicModalOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                New Topic
              </Button>
            </Box>
            <Divider sx={{ mb: 1, borderColor: DIVIDER_COLOR }} />

            {topicsLoading ? (
              <LinearProgress color="primary" sx={{ mt: 2 }} />
            ) : topics.length === 0 ? (
              <EmptyState icon={Forum} message="No discussion topics yet." />
            ) : (
              <List disablePadding>
                {topics.map((topic) => (
                  <ListItem key={topic.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={selectedTopicId === topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        border: '1px solid transparent',
                        '&.Mui-selected': {
                          background: 'rgba(8,145,178,0.08)',
                          borderColor: 'rgba(8,145,178,0.3)',
                          '&:hover': { background: 'rgba(8,145,178,0.12)' },
                          '& .MuiListItemText-primary': {
                            fontWeight: 700,
                            color: TEAL,
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={topic.title}
                        secondary={
                          <>
                            {topic.author?.name} · {topic._count?.posts || 0} posts ·{' '}
                            {formatDistanceToNow(new Date(topic.createdAt), {
                              addSuffix: true,
                            })}
                          </>
                        }
                        primaryTypographyProps={{
                          fontSize: '0.88rem',
                          fontWeight: 500,
                          noWrap: true,
                        }}
                        secondaryTypographyProps={{ fontSize: '0.72rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Right – Posts */}
      <Grid item xs={12} md={8}>
        {selectedTopicId && selectedTopic ? (
          <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
            <CardContent sx={{ p: 3 }}>
              {/* Topic header */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" fontWeight={700}>
                  {selectedTopic.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar
                    sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: TEAL }}
                  >
                    {selectedTopic.author?.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {selectedTopic.author?.name} ·{' '}
                    {formatDistanceToNow(new Date(selectedTopic.createdAt), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1.5,
                    p: 2,
                    bgcolor: 'rgba(8,145,178,0.03)',
                    borderRadius: 2,
                    border: '1px solid rgba(8,145,178,0.08)',
                  }}
                >
                  {selectedTopic.content}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: DIVIDER_COLOR }} />

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Replies ({posts.length})
              </Typography>

              {postsLoading ? (
                <LinearProgress color="primary" />
              ) : posts.length === 0 ? (
                <Box
                  sx={{
                    py: 3,
                    textAlign: 'center',
                    border: '1px dashed rgba(8,145,178,0.15)',
                    borderRadius: 2,
                    mb: 2.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No replies yet. Be the first to respond!
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    mb: 2.5,
                    maxHeight: 400,
                    overflowY: 'auto',
                    pr: 1,
                  }}
                >
                  {posts.map((post) => (
                    <Paper
                      key={post.id}
                      sx={{
                        p: 2,
                        border: '1px solid rgba(8,145,178,0.08)',
                        bgcolor: 'rgba(8,145,178,0.01)',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.75rem',
                            bgcolor: TEAL,
                          }}
                        >
                          {post.author?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ lineHeight: 1.2 }}
                          >
                            {post.author?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ pl: 5.5, whiteSpace: 'pre-wrap' }}
                      >
                        {post.content}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Reply input */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Write a reply..."
                  multiline
                  maxRows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostReply();
                    }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  onClick={handlePostReply}
                  disabled={creatingPost || !replyText.trim()}
                  sx={{ borderRadius: 2, minWidth: 48 }}
                >
                  <Send sx={{ fontSize: 18 }} />
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              py: 12,
              border: '1px dashed rgba(8,145,178,0.25)',
              borderRadius: 3,
              background: 'rgba(8,145,178,0.01)',
            }}
          >
            <Forum sx={{ fontSize: 48, color: TEAL, mb: 1.5, opacity: 0.6 }} />
            <Typography variant="body1" fontWeight={700}>
              Select a Topic
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, textAlign: 'center', maxWidth: 300 }}
            >
              Choose a discussion topic from the list or create a new one.
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Create Topic Modal */}
      <Dialog
        open={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>New Discussion Topic</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Topic Title"
                fullWidth
                value={topicForm.title}
                onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Opening Post"
                fullWidth
                multiline
                rows={4}
                value={topicForm.content}
                onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                placeholder="Share your thoughts, questions, or discussion points..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setTopicModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreateTopic} variant="contained" disabled={creatingTopic}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

/* ========================================================================== */
/*  TAB 5 – SURVEYS (PLACEHOLDER)                                             */
/* ========================================================================== */
function SurveysTab() {
  return (
    <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            py: 10,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(6,182,212,0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <Poll sx={{ fontSize: 36, color: TEAL }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Course Surveys Coming Soon
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 420 }}
          >
            Course-level surveys will be available here soon. In the meantime, you can manage
            surveys at the batch level from the <strong>Programs &amp; Batches</strong> page.
          </Typography>
          <Chip
            label="In Development"
            size="small"
            sx={{
              mt: 2.5,
              bgcolor: 'rgba(245,158,11,0.1)',
              color: '#d97706',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

/* ========================================================================== */
/*  TAB 6 – AI AGENT                                                          */
/* ========================================================================== */
function AgentTab({
  courseId,
  canManage,
}: {
  courseId: string;
  canManage: boolean;
}) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [agentForm, setAgentForm] = useState({
    name: '',
    systemPrompt: '',
    isActive: true,
  });
  const [formDirty, setFormDirty] = useState(false);

  const { data: agentRes, isLoading: agentLoading } = useGetAgentQuery(courseId);
  const agent = agentRes?.data;

  const [updateAgent, { isLoading: updating }] = useUpdateAgentMutation();
  const [chatWithAgent, { isLoading: chatting }] = useChatWithAgentMutation();

  // Sync form from server when agent data arrives
  useEffect(() => {
    if (agent && !formDirty) {
      setAgentForm({
        name: agent.name || '',
        systemPrompt: agent.systemPrompt || '',
        isActive: agent.isActive ?? true,
      });
    }
  }, [agent, formDirty]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSaveAgent = async () => {
    if (!agentForm.name.trim()) {
      toast.error('Agent name is required');
      return;
    }
    try {
      await updateAgent({
        id: courseId,
        body: {
          name: agentForm.name.trim(),
          systemPrompt: agentForm.systemPrompt.trim(),
          isActive: agentForm.isActive,
        },
      }).unwrap();
      toast.success('Agent configuration saved');
      setFormDirty(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save agent configuration');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: msg }]);

    try {
      const res = await chatWithAgent({ id: courseId, message: msg }).unwrap();
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.response },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Config panel */}
      <Grid item xs={12} md={5}>
        <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW, height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  display: 'flex',
                }}
              >
                <SmartToy sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  AI Agent Configuration
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Customize your course AI teaching assistant.
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: DIVIDER_COLOR }} />

            {agentLoading ? (
              <LinearProgress color="primary" />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Agent Name"
                  fullWidth
                  size="small"
                  value={agentForm.name}
                  onChange={(e) => {
                    setAgentForm({ ...agentForm, name: e.target.value });
                    setFormDirty(true);
                  }}
                  disabled={!canManage}
                  placeholder="e.g. CourseBot, Professor AI"
                />
                <TextField
                  label="System Prompt"
                  fullWidth
                  multiline
                  rows={6}
                  size="small"
                  value={agentForm.systemPrompt}
                  onChange={(e) => {
                    setAgentForm({ ...agentForm, systemPrompt: e.target.value });
                    setFormDirty(true);
                  }}
                  disabled={!canManage}
                  placeholder="You are a helpful teaching assistant for this course..."
                  sx={{ '& textarea': { fontSize: '0.85rem', lineHeight: 1.6 } }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={agentForm.isActive}
                      onChange={(e) => {
                        setAgentForm({ ...agentForm, isActive: e.target.checked });
                        setFormDirty(true);
                      }}
                      disabled={!canManage}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: TEAL },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: TEAL,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      Agent {agentForm.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  }
                />
                {canManage && (
                  <Button
                    variant="contained"
                    onClick={handleSaveAgent}
                    disabled={updating}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {updating ? 'Saving...' : 'Save Configuration'}
                  </Button>
                )}
                {agent && (
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: 'rgba(8,145,178,0.03)',
                      border: '1px solid rgba(8,145,178,0.08)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Status:{' '}
                      <Chip
                        label={agent.isActive ? 'Online' : 'Offline'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          bgcolor: agent.isActive
                            ? 'rgba(16,185,129,0.1)'
                            : 'rgba(239,68,68,0.1)',
                          color: agent.isActive ? '#059669' : '#ef4444',
                        }}
                      />
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Chat panel */}
      <Grid item xs={12} md={7}>
        <Card
          sx={{
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Chat with {agent?.name || 'AI Agent'}
              </Typography>
              {agent?.isActive && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 6px rgba(16,185,129,0.5)',
                  }}
                />
              )}
            </Box>
            <Divider sx={{ mb: 2, borderColor: DIVIDER_COLOR }} />

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                minHeight: 350,
                maxHeight: 450,
                overflowY: 'auto',
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(8,145,178,0.02)',
                border: '1px solid rgba(8,145,178,0.08)',
              }}
            >
              {chatHistory.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    opacity: 0.6,
                  }}
                >
                  <SmartToy sx={{ fontSize: 40, color: TEAL, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Start a conversation with the AI agent.
                    <br />
                    Ask questions about the course material!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {chatHistory.map((m, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '80%',
                          p: 1.5,
                          px: 2,
                          borderRadius:
                            m.role === 'user'
                              ? '16px 16px 4px 16px'
                              : '16px 16px 16px 4px',
                          background:
                            m.role === 'user'
                              ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
                              : 'rgba(255,255,255,0.95)',
                          color: m.role === 'user' ? 'white' : 'text.primary',
                          border:
                            m.role === 'assistant'
                              ? '1px solid rgba(8,145,178,0.12)'
                              : 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                        >
                          {m.content}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {chatting && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Box
                        sx={{
                          p: 1.5,
                          px: 2,
                          borderRadius: '16px 16px 16px 4px',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(8,145,178,0.12)',
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          Thinking...
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </Box>
              )}
            </Box>

            {/* Input */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                fullWidth
                placeholder={
                  agent?.isActive ? 'Ask the AI agent...' : 'Agent is currently offline'
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!agent?.isActive || chatting}
                multiline
                maxRows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!agent?.isActive || chatting || !chatInput.trim()}
                sx={{ borderRadius: 2, minWidth: 48, px: 2 }}
              >
                <Send sx={{ fontSize: 18 }} />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

/* ========================================================================== */
/*  TAB 7 – ANALYTICS                                                         */
/* ========================================================================== */
function AnalyticsTab({ courseId }: { courseId: string }) {
  const { data: analyticsRes, isLoading, error } = useGetCourseAnalyticsQuery(courseId);
  const stats = analyticsRes?.data;

  if (isLoading) return <LinearProgress color="primary" />;

  if (error || !stats) {
    return (
      <Alert severity="warning">
        Failed to load course analytics. Please try again later.
      </Alert>
    );
  }

  const submissionRate =
    stats.totalAssignments > 0 && stats.totalEnrollments > 0
      ? Math.min(
          Math.round(
            (stats.totalSubmissions /
              (stats.totalEnrollments * stats.totalAssignments)) *
              100
          ),
          100
        )
      : 0;

  const statCards = [
    {
      label: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: <People sx={{ color: 'white', fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    },
    {
      label: 'Assignments',
      value: stats.totalAssignments,
      icon: <AssignmentTurnedIn sx={{ color: 'white', fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    },
    {
      label: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: <Description sx={{ color: 'white', fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      label: 'Engagement Rate',
      value: `${stats.averageEngagement}%`,
      icon: <TrendingUp sx={{ color: 'white', fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: <EmojiEvents sx={{ color: 'white', fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5}>
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={idx < 3 ? 4 : 6} key={idx}>
            <Card
              sx={{
                borderRadius: 3,
                background: card.gradient,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -30,
                  left: -10,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: '20px !important',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    color="white"
                    sx={{ lineHeight: 1.1 }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                      fontSize: '0.78rem',
                    }}
                  >
                    {card.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Performance Overview ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                Engagement Overview
              </Typography>
              <Divider sx={{ mb: 2.5, borderColor: DIVIDER_COLOR }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <ProgressBar
                  label="Student Engagement"
                  value={stats.averageEngagement}
                  color={TEAL}
                  gradient="linear-gradient(90deg, #0891b2, #06b6d4)"
                  bgColor="rgba(8,145,178,0.1)"
                />
                <ProgressBar
                  label="Course Completion"
                  value={stats.completionRate}
                  color="#10b981"
                  gradient="linear-gradient(90deg, #10b981, #34d399)"
                  bgColor="rgba(16,185,129,0.1)"
                />
                <ProgressBar
                  label="Submission Rate"
                  value={submissionRate}
                  color="#6366f1"
                  gradient="linear-gradient(90deg, #6366f1, #a855f7)"
                  bgColor="rgba(99,102,241,0.1)"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                Quick Stats
              </Typography>
              <Divider sx={{ mb: 2.5, borderColor: DIVIDER_COLOR }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <QuickStatRow
                  label="Avg. Submissions per Assignment"
                  value={
                    stats.totalAssignments > 0
                      ? (stats.totalSubmissions / stats.totalAssignments).toFixed(1)
                      : '0'
                  }
                  color={TEAL}
                />
                <QuickStatRow
                  label="Assignments Available"
                  value={String(stats.totalAssignments)}
                  color="#6366f1"
                />
                <QuickStatRow
                  label="Students without Submissions"
                  value={String(
                    Math.max(
                      0,
                      stats.totalEnrollments -
                        Math.ceil(
                          stats.totalSubmissions /
                            Math.max(stats.totalAssignments, 1)
                        )
                    )
                  )}
                  color="#ef4444"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ========================================================================== */
/*  SHARED MICRO-COMPONENTS                                                   */
/* ========================================================================== */

/** Section header used by multiple tabs */
function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {action}
      </Box>
      <Divider sx={{ mb: 3, borderColor: DIVIDER_COLOR }} />
    </>
  );
}

/** Empty state placeholder */
function EmptyState({
  icon: Icon,
  message,
  hint,
}: {
  icon: React.ElementType;
  message: string;
  hint?: string;
}) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Icon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

/** Numbered circle badge */
function NumberBadge({ num }: { num: number }) {
  return (
    <Box
      sx={{
        minWidth: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 0.2,
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
      >
        {num}
      </Typography>
    </Box>
  );
}

/** Simple info row */
function InfoRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={multiline ? { whiteSpace: 'pre-wrap' } : undefined}
      >
        {value}
      </Typography>
    </Box>
  );
}

/** Status chip helper */
function StatusChip({
  label,
  active,
  activeColor,
  activeBg,
  inactiveColor,
  inactiveBg,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  activeBg: string;
  inactiveColor: string;
  inactiveBg: string;
}) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontSize: '0.72rem',
        background: active ? activeBg : inactiveBg,
        color: active ? activeColor : inactiveColor,
      }}
    />
  );
}

/** Progress bar row for analytics */
function ProgressBar({
  label,
  value,
  color,
  gradient,
  bgColor,
}: {
  label: string;
  value: number;
  color: string;
  gradient: string;
  bgColor: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color }}>
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: bgColor,
          '& .MuiLinearProgress-bar': { background: gradient, borderRadius: 5 },
        }}
      />
    </Box>
  );
}

/** Quick stat row for analytics */
function QuickStatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: 'rgba(8,145,178,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  );
}
