'use client';

import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Divider,
  Radio, RadioGroup, FormControlLabel, FormLabel, Alert, CircularProgress, Tooltip,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress
} from '@mui/material';
import {
  Add, Delete, Quiz as QuizIcon, CheckCircle, Cancel, Timer,
  ExpandMore, Send, Lock, School, EmojiEvents, QuestionAnswer
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import {
  Quiz, QuizQuestion, QuizAttempt,
  useCreateQuizMutation,
  useCreateQuizQuestionMutation,
  useDeleteQuizMutation,
  useDeleteQuizQuestionMutation,
  useSubmitQuizAttemptMutation,
  useGetQuizAttemptsQuery,
  useUpdateQuizMutation,
} from '@/store/slices/courseSlice';

// ─── Types ───
interface QuizSectionProps {
  unitId: string;
  quizzes: Quiz[];
  canManage: boolean;
  userId?: string;
}

// ─── Create Quiz Dialog ───
function CreateQuizDialog({ open, onClose, unitId }: { open: boolean; onClose: () => void; unitId: string }) {
  const [form, setForm] = useState({ title: '', description: '', timeLimit: '', maxAttempts: '1' });
  const [createQuiz, { isLoading }] = useCreateQuizMutation();

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      await createQuiz({
        unitId,
        title: form.title,
        description: form.description || undefined,
        timeLimit: form.timeLimit ? parseInt(form.timeLimit) : undefined,
        maxAttempts: parseInt(form.maxAttempts) || 1,
      }).unwrap();
      toast.success('Quiz created!');
      setForm({ title: '', description: '', timeLimit: '', maxAttempts: '1' });
      onClose();
    } catch (e) {
      toast.error('Failed to create quiz');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create Quiz</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Quiz Title" fullWidth value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <TextField label="Description (optional)" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Time Limit (min)" type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: e.target.value }))} sx={{ flex: 1 }} inputProps={{ min: 1 }} helperText="Leave blank for unlimited" />
            <TextField label="Max Attempts" type="number" value={form.maxAttempts} onChange={e => setForm(p => ({ ...p, maxAttempts: e.target.value }))} sx={{ flex: 1 }} inputProps={{ min: 1 }} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}Create Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Add Question Dialog ───
function AddQuestionDialog({ open, onClose, quizId }: { open: boolean; onClose: () => void; quizId: string }) {
  const [form, setForm] = useState({
    type: 'MCQ' as 'MCQ' | 'SAQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: '1',
    modelAnswer: '',
  });
  const [createQuestion, { isLoading }] = useCreateQuizQuestionMutation();

  const handleOptionChange = (i: number, val: string) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm(p => ({ ...p, options: opts }));
  };

  const handleSubmit = async () => {
    if (!form.questionText.trim()) { toast.error('Question text required'); return; }
    try {
      const payload: any = {
        quizId,
        type: form.type,
        questionText: form.questionText,
        points: parseInt(form.points) || 1,
      };
      if (form.type === 'MCQ') {
        const validOpts = form.options.filter(o => o.trim());
        if (validOpts.length < 2) { toast.error('At least 2 options needed'); return; }
        if (!form.correctAnswer) { toast.error('Select correct answer'); return; }
        payload.optionsJson = validOpts;
        payload.correctAnswer = form.correctAnswer;
      } else {
        payload.correctAnswer = form.modelAnswer || undefined;
      }
      await createQuestion(payload).unwrap();
      toast.success('Question added!');
      setForm({ type: 'MCQ', questionText: '', options: ['', '', '', ''], correctAnswer: '', points: '1', modelAnswer: '' });
      onClose();
    } catch (e) {
      toast.error('Failed to add question');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Question</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl>
            <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Question Type</FormLabel>
            <RadioGroup row value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any, correctAnswer: '' }))}>
              <FormControlLabel value="MCQ" control={<Radio />} label="Multiple Choice (MCQ)" />
              <FormControlLabel value="SAQ" control={<Radio />} label="Short Answer (SAQ)" />
            </RadioGroup>
          </FormControl>
          <TextField label="Question Text" fullWidth multiline rows={2} value={form.questionText} onChange={e => setForm(p => ({ ...p, questionText: e.target.value }))} />
          {form.type === 'MCQ' && (
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Answer Options</Typography>
              {form.options.map((opt, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Radio checked={form.correctAnswer === opt && opt !== ''} onChange={() => opt && setForm(p => ({ ...p, correctAnswer: opt }))} size="small" sx={{ color: '#0891b2' }} />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                  />
                </Box>
              ))}
              <Typography variant="caption" color="text.secondary">Click the radio button next to the correct answer</Typography>
            </Box>
          )}
          {form.type === 'SAQ' && (
            <TextField label="Model Answer (optional, for instructor reference)" fullWidth multiline rows={3} value={form.modelAnswer} onChange={e => setForm(p => ({ ...p, modelAnswer: e.target.value }))} />
          )}
          <TextField label="Points" type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))} inputProps={{ min: 1 }} sx={{ width: 120 }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>Add Question</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Quiz Taker ───
function QuizTaker({ quiz, userId }: { quiz: Quiz; userId?: string }) {
  const questions = quiz.questions || [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitAttempt, { isLoading }] = useSubmitQuizAttemptMutation();
  const { data: attemptsData } = useGetQuizAttemptsQuery(quiz.id);
  const attempts = attemptsData?.data || [];
  const myAttempts = attempts.filter(a => a.userId === userId);
  const latestAttempt = myAttempts[0];
  const attemptsUsed = myAttempts.filter(a => a.status !== 'IN_PROGRESS').length;
  const canAttempt = attemptsUsed < quiz.maxAttempts;

  const handleSubmit = async () => {
    if (!canAttempt) return;
    const answersArr = questions.map(q => ({ questionId: q.id, answerText: answers[q.id] || '' }));
    try {
      const res = await submitAttempt({ quizId: quiz.id, answers: answersArr }).unwrap();
      setResult(res.data);
      setSubmitted(true);
      toast.success('Quiz submitted!');
    } catch (e) {
      toast.error('Failed to submit quiz');
    }
  };

  if (!canAttempt && !submitted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', border: '1px solid rgba(8,145,178,0.15)', borderRadius: 2 }}>
        <Lock sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
        <Typography fontWeight={700}>Maximum Attempts Reached</Typography>
        <Typography variant="body2" color="text.secondary">You have used all {quiz.maxAttempts} allowed attempt(s).</Typography>
        {latestAttempt && latestAttempt.score !== null && (
          <Chip label={`Best Score: ${latestAttempt.score}/${latestAttempt.maxScore}`} color="primary" sx={{ mt: 2 }} />
        )}
      </Box>
    );
  }

  if (submitted && result) {
    const pct = result.maxScore ? Math.round((result.score ?? 0) / result.maxScore * 100) : null;
    return (
      <Box sx={{ p: 3, border: '1px solid rgba(8,145,178,0.15)', borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <EmojiEvents sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>Quiz Submitted!</Typography>
          {result.status === 'GRADED' && pct !== null ? (
            <>
              <Typography variant="h4" fontWeight={800} sx={{ color: pct >= 60 ? '#10b981' : '#ef4444', my: 1 }}>
                {result.score} / {result.maxScore}
              </Typography>
              <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.1)', '& .MuiLinearProgress-bar': { bgcolor: pct >= 60 ? '#10b981' : '#ef4444' } }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{pct}% score</Typography>
            </>
          ) : (
            <Chip label="Awaiting manual grading for SAQ answers" color="warning" sx={{ mt: 1 }} />
          )}
        </Box>
        {result.answers?.map((ans: any, i: number) => (
          <Box key={ans.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: ans.isCorrect === true ? 'rgba(16,185,129,0.08)' : ans.isCorrect === false ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: ans.isCorrect === true ? 'rgba(16,185,129,0.3)' : ans.isCorrect === false ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.1)' }}>
            <Typography variant="body2" fontWeight={600}>Q{i + 1}: {ans.question?.questionText}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>Your answer: <strong>{ans.answerText}</strong></Typography>
            {ans.isCorrect !== null && <Typography variant="body2">{ans.isCorrect ? '✓ Correct' : `✗ Correct: ${ans.question?.correctAnswer}`}</Typography>}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>{quiz.title}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {quiz.timeLimit && <Chip icon={<Timer sx={{ fontSize: 16 }} />} label={`${quiz.timeLimit} min`} size="small" />}
          <Chip label={`${attemptsUsed}/${quiz.maxAttempts} attempts used`} size="small" color="default" />
        </Box>
      </Box>
      {questions.map((q, i) => (
        <Box key={q.id} sx={{ mb: 3, p: 2, border: '1px solid rgba(8,145,178,0.15)', borderRadius: 2 }}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5 }}>
            Q{i + 1}. {q.questionText} <Chip label={`${q.points} pt${q.points > 1 ? 's' : ''}`} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
          </Typography>
          {q.type === 'MCQ' ? (
            <RadioGroup value={answers[q.id] || ''} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}>
              {JSON.parse(q.optionsJson || '[]').map((opt: string, oi: number) => (
                <FormControlLabel key={oi} value={opt} control={<Radio size="small" sx={{ color: '#0891b2' }} />} label={opt} />
              ))}
            </RadioGroup>
          ) : (
            <TextField fullWidth multiline rows={3} placeholder="Type your answer here..." value={answers[q.id] || ''} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} variant="outlined" size="small" />
          )}
        </Box>
      ))}
      {questions.length === 0 && <Typography color="text.secondary" sx={{ py: 2 }}>No questions added yet.</Typography>}
      {questions.length > 0 && (
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={16} /> : <Send />} sx={{ mt: 1 }}>
          Submit Quiz
        </Button>
      )}
    </Box>
  );
}

// ─── Main QuizSection ───
export default function QuizSection({ unitId, quizzes, canManage, userId }: QuizSectionProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addQDialogOpen, setAddQDialogOpen] = useState<string | null>(null);
  const [deleteQuiz] = useDeleteQuizMutation();
  const [deleteQuestion] = useDeleteQuizQuestionMutation();
  const [updateQuiz] = useUpdateQuizMutation();

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz and all questions?')) return;
    try { await deleteQuiz(quizId).unwrap(); toast.success('Quiz deleted'); } catch { toast.error('Failed'); }
  };
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Delete this question?')) return;
    try { await deleteQuestion(qId).unwrap(); toast.success('Question deleted'); } catch { toast.error('Failed'); }
  };
  const handlePublishToggle = async (quiz: Quiz) => {
    try {
      await updateQuiz({ quizId: quiz.id, body: { isPublished: !quiz.isPublished } }).unwrap();
      toast.success(quiz.isPublished ? 'Quiz unpublished' : 'Quiz published!');
    } catch { toast.error('Failed'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuizIcon sx={{ color: '#0891b2' }} /> Quizzes
        </Typography>
        {canManage && (
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)} sx={{ textTransform: 'none' }}>
            Add Quiz
          </Button>
        )}
      </Box>

      {quizzes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, border: '1px dashed rgba(8,145,178,0.3)', borderRadius: 2 }}>
          <QuizIcon sx={{ fontSize: 40, color: '#0891b2', opacity: 0.5, mb: 1 }} />
          <Typography color="text.secondary">No quizzes yet{canManage ? '. Add one above.' : '.'}</Typography>
        </Box>
      )}

      {quizzes.map(quiz => (
        <Accordion key={quiz.id} sx={{ mb: 1.5, border: '1px solid rgba(8,145,178,0.15)', borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 'none' }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, mr: 1 }}>
              <QuizIcon sx={{ color: '#0891b2', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{quiz.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {quiz.questions?.length || 0} questions · {quiz._count?.attempts || 0} attempts · Max {quiz.maxAttempts} attempt(s)
                </Typography>
              </Box>
              <Chip label={quiz.isPublished ? 'Published' : 'Draft'} size="small" color={quiz.isPublished ? 'success' : 'default'} />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            {canManage ? (
              <Box>
                {/* Question builder for instructors */}
                <Box sx={{ mb: 2 }}>
                  {(quiz.questions || []).map((q, i) => (
                    <Box key={q.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1, p: 1.5, bgcolor: 'rgba(8,145,178,0.03)', borderRadius: 2, border: '1px solid rgba(8,145,178,0.1)' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Q{i + 1} [{q.type}] — {q.questionText}</Typography>
                        {q.type === 'MCQ' && q.optionsJson && (
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {JSON.parse(q.optionsJson).map((opt: string) => (
                              <Chip key={opt} label={opt} size="small" color={opt === q.correctAnswer ? 'success' : 'default'} icon={opt === q.correctAnswer ? <CheckCircle sx={{ fontSize: 14 }} /> : undefined} />
                            ))}
                          </Box>
                        )}
                        {q.type === 'SAQ' && <Typography variant="caption" color="text.secondary">SAQ — Manual grading required · {q.points} pt(s)</Typography>}
                      </Box>
                      <Chip label={`${q.points}pt`} size="small" />
                      <Tooltip title="Delete question">
                        <IconButton size="small" onClick={() => handleDeleteQuestion(q.id)} color="error"><Delete sx={{ fontSize: 16 }} /></IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" startIcon={<Add />} variant="outlined" onClick={() => setAddQDialogOpen(quiz.id)} sx={{ textTransform: 'none' }}>Add Question</Button>
                  <Button size="small" variant={quiz.isPublished ? 'outlined' : 'contained'} onClick={() => handlePublishToggle(quiz)} sx={{ textTransform: 'none' }}>
                    {quiz.isPublished ? 'Unpublish' : 'Publish Quiz'}
                  </Button>
                  <Button size="small" color="error" variant="outlined" startIcon={<Delete />} onClick={() => handleDeleteQuiz(quiz.id)} sx={{ textTransform: 'none' }}>Delete Quiz</Button>
                </Box>
                {addQDialogOpen === quiz.id && <AddQuestionDialog open quizId={quiz.id} onClose={() => setAddQDialogOpen(null)} />}
              </Box>
            ) : (
              quiz.isPublished ? (
                <QuizTaker quiz={quiz} userId={userId} />
              ) : (
                <Alert severity="info" icon={<Lock />}>This quiz is not yet published.</Alert>
              )
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <CreateQuizDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} unitId={unitId} />
    </Box>
  );
}
