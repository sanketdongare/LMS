'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, TextField, Button, Typography,
  IconButton, InputAdornment, Alert, CircularProgress, Chip, LinearProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, School, Email, Lock, Person,
  ArrowForward, CheckCircle, AutoAwesome,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { registerWithEmail, loginWithGoogle, clearError } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

// ─── Floating particle ───────────────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <Box
      sx={{
        position: 'absolute', borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        animation: 'float-up linear infinite',
        '@keyframes float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 0.6 },
          '100%': { transform: 'translateY(-100vh) scale(0.5)', opacity: 0 },
        },
        pointerEvents: 'none', ...style,
      }}
    />
  );
}

// ─── Password strength bar ───────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ characters', ok: password.length >= 6 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <Box sx={{ mt: -1.5, mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(score / 4) * 100}
          sx={{
            flex: 1, height: 5, borderRadius: 10,
            backgroundColor: 'rgba(0,0,0,0.08)',
            '& .MuiLinearProgress-bar': { backgroundColor: colors[score - 1] || '#e5e7eb', borderRadius: 10, transition: 'all 0.4s ease' },
          }}
        />
        <Typography variant="caption" sx={{ color: colors[score - 1] || '#94a3b8', fontWeight: 700, minWidth: 48 }}>
          {score > 0 ? labels[score - 1] : ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {checks.map((c) => (
          <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <CheckCircle sx={{ fontSize: 12, color: c.ok ? '#10b981' : '#cbd5e1' }} />
            <Typography variant="caption" sx={{ color: c.ok ? '#10b981' : '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>{c.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Glow input field ────────────────────────────────────────────────────────
function GlowField({
  id, label, type, value, onChange, error, helperText, icon, endAdornment, autoComplete,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; error?: boolean; helperText?: string;
  icon: React.ReactNode; endAdornment?: React.ReactNode; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Box sx={{ mb: 2.5, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute', inset: -1, borderRadius: '13px',
          background: focused ? 'linear-gradient(135deg, #0891b2, #0d9488)' : 'transparent',
          opacity: focused ? 0.3 : 0, transition: 'opacity 0.3s ease',
          pointerEvents: 'none', zIndex: 0, filter: 'blur(4px)',
        }}
      />
      <TextField
        id={id} label={label} type={type} fullWidth value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        error={error} helperText={helperText} autoComplete={autoComplete} required
        sx={{
          position: 'relative', zIndex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px', transition: 'all 0.25s ease', background: '#fff',
            '& fieldset': { borderColor: error ? '#ef4444' : 'rgba(8,145,178,0.25)', borderWidth: '1.5px' },
            '&:hover fieldset': { borderColor: 'rgba(8,145,178,0.55)' },
            '&.Mui-focused fieldset': { borderColor: '#0891b2', borderWidth: '2px' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#0891b2' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ color: focused ? '#0891b2' : '#94a3b8', transition: 'color 0.25s', display: 'flex' }}>{icon}</Box>
            </InputAdornment>
          ),
          endAdornment,
        }}
      />
    </Box>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (error) dispatch(clearError()); }, [name, email, password]);

  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setEmailError('Please enter a valid email');
    else setEmailError('');
  }, [email]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) { triggerShake(); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); triggerShake(); return; }
    dispatch(clearError());
    try {
      await dispatch(registerWithEmail({ email, password, name })).unwrap();
      setSuccess(true);
      toast.success('Account created! Welcome to SDLMS 🎉');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      triggerShake();
      toast.error(err || 'Registration failed');
    }
  };

  const handleGoogle = async () => {
    dispatch(clearError());
    try {
      await dispatch(loginWithGoogle()).unwrap();
      setSuccess(true);
      toast.success('Welcome to SDLMS!');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      toast.error(err || 'Google login failed');
    }
  };

  const particles = [
    { width: 10, left: '12%', animationDuration: '9s', animationDelay: '0s' },
    { width: 14, left: '35%', animationDuration: '12s', animationDelay: '3s' },
    { width: 8, left: '58%', animationDuration: '8s', animationDelay: '1s' },
    { width: 16, left: '75%', animationDuration: '11s', animationDelay: '5s' },
    { width: 6, left: '90%', animationDuration: '7s', animationDelay: '2s' },
    { width: 12, left: '5%', animationDuration: '13s', animationDelay: '4s' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', background: '#f8fafc',
        '@keyframes shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-8px)' }, '30%': { transform: 'translateX(8px)' },
          '45%': { transform: 'translateX(-6px)' }, '60%': { transform: 'translateX(6px)' },
          '75%': { transform: 'translateX(-3px)' }, '90%': { transform: 'translateX(3px)' },
        },
        '@keyframes slide-in-left': { from: { opacity: 0, transform: 'translateX(-40px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes slide-in-right': { from: { opacity: 0, transform: 'translateX(40px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes pulse-ring': { '0%': { transform: 'scale(1)', opacity: 0.4 }, '100%': { transform: 'scale(1.6)', opacity: 0 } },
        '@keyframes bounce-in': { '0%': { transform: 'scale(0)', opacity: 0 }, '60%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      }}
    >
      {/* ── Left branding ─────────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' }, flex: '0 0 42%',
          flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, #0d9488 0%, #0891b2 60%, #0e7490 100%)',
          animation: 'slide-in-left 0.7s cubic-bezier(0.22,1,0.36,1) forwards', p: 6,
        }}
      >
        {particles.map((p, i) => (
          <Particle key={i} style={{ width: p.width, height: p.width, left: p.left, bottom: '-10%', animationDuration: p.animationDuration, animationDelay: p.animationDelay }} />
        ))}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex' }}>
              <School sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>SDLMS</Typography>
          </Box>

          <Chip
            icon={<AutoAwesome sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.9) !important' }} />}
            label="Join 48,000+ learners"
            size="small"
            sx={{ mb: 3, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', fontWeight: 600 }}
          />

          <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2, mb: 2, fontSize: '2rem' }}>
            Start your learning journey today
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mb: 5, lineHeight: 1.8 }}>
            Create your free account and get instant access to thousands of courses across top universities.
          </Typography>

          {/* Step indicators */}
          {[
            { step: '1', text: 'Create your free account' },
            { step: '2', text: 'Browse & enroll in courses' },
            { step: '3', text: 'Learn, track & earn certificates' },
          ].map((s) => (
            <Box key={s.step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>{s.step}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{s.text}</Typography>
            </Box>
          ))}

          {/* Stats row */}
          <Box sx={{ mt: 5, display: 'flex', gap: 3 }}>
            {[{ val: '500+', label: 'Institutions' }, { val: '12K+', label: 'Courses' }, { val: 'Free', label: 'To Start' }].map((s) => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>{s.val}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Right form ────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          p: { xs: 3, sm: 5 }, overflowY: 'auto',
          animation: 'slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
          background: 'radial-gradient(ellipse at 80% 10%, rgba(8,145,178,0.06) 0%, transparent 55%), #f8fafc',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.2, mb: 4, justifyContent: 'center' }}>
            <Box sx={{ p: 0.8, borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #0d9488)', display: 'flex' }}>
              <School sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SDLMS</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>Create account</Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#0891b2', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 3, borderRadius: 2, animation: 'bounce-in 0.4s ease forwards', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 1.5, animation: 'bounce-in 0.4s ease forwards' }}>
              <CheckCircle sx={{ color: '#10b981', fontSize: 22 }} />
              <Typography variant="body2" fontWeight={600} sx={{ color: '#065f46' }}>Account created! Redirecting…</Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleRegister} sx={{ animation: shake ? 'shake 0.6s ease forwards' : 'none' }}>
            <GlowField id="register-name" label="Full Name" type="text" value={name} onChange={setName} icon={<Person sx={{ fontSize: 20 }} />} autoComplete="name" />

            <GlowField
              id="register-email" label="Email Address" type="email" value={email} onChange={setEmail}
              error={Boolean(emailError)} helperText={emailError}
              icon={<Email sx={{ fontSize: 20 }} />} autoComplete="email"
            />

            <GlowField
              id="register-password" label="Password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={setPassword}
              icon={<Lock sx={{ fontSize: 20 }} />}
              autoComplete="new-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton id="toggle-reg-password" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8', '&:hover': { color: '#0891b2' }, transition: 'color 0.2s' }}>
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              }
            />

            {/* Password strength */}
            <PasswordStrength password={password} />

            {/* Submit */}
            <Box sx={{ position: 'relative' }}>
              {!loading && !success && name && email && password.length >= 6 && !emailError && (
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '12px', border: '2px solid rgba(8,145,178,0.4)', animation: 'pulse-ring 1.5s ease-out infinite', pointerEvents: 'none' }} />
              )}
              <Button
                id="register-submit-btn"
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || success || Boolean(emailError)}
                endIcon={!loading && !success ? <ArrowForward /> : undefined}
                sx={{
                  py: 1.6, fontSize: '1rem', fontWeight: 700, borderRadius: '12px',
                  background: success
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #0891b2, #0d9488)',
                  boxShadow: '0 8px 24px rgba(8,145,178,0.35)',
                  transition: 'all 0.3s ease',
                  '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)', boxShadow: '0 12px 32px rgba(8,145,178,0.48)', transform: 'translateY(-1px)' },
                  '&:active': { transform: 'translateY(0px)' },
                  '&.Mui-disabled': { background: 'rgba(8,145,178,0.4)', color: 'rgba(255,255,255,0.7)' },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  : success ? '✓ Account Created!'
                    : 'Create Free Account'}
              </Button>
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(8,145,178,0.15)' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>OR</Typography>
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(8,145,178,0.15)' }} />
          </Box>

          {/* Google */}
          <Button
            id="google-register-btn"
            variant="outlined"
            fullWidth
            size="large"
            onClick={handleGoogle}
            disabled={loading || success}
            sx={{
              py: 1.5, borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
              borderColor: 'rgba(8,145,178,0.25)', color: '#334155', background: '#fff',
              transition: 'all 0.25s ease',
              '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.04)', boxShadow: '0 4px 16px rgba(8,145,178,0.12)', transform: 'translateY(-1px)' },
              '&:active': { transform: 'translateY(0)' },
            }}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            }
          >
            Continue with Google
          </Button>

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', mt: 4, lineHeight: 1.7 }}>
            By registering, you agree to our{' '}
            <Box component="span" sx={{ color: '#0891b2', cursor: 'pointer', fontWeight: 600 }}>Terms</Box>
            {' & '}
            <Box component="span" sx={{ color: '#0891b2', cursor: 'pointer', fontWeight: 600 }}>Privacy Policy</Box>
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', '&:hover': { color: '#0891b2' }, transition: 'color 0.2s', cursor: 'pointer' }}>
                ← Back to homepage
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
