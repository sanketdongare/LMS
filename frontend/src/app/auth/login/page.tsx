'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, TextField, Button, Typography,
  IconButton, InputAdornment, Alert, CircularProgress, Chip,
} from '@mui/material';
import {
  Visibility, VisibilityOff, School, Email, Lock,
  ArrowForward, CheckCircle, AutoAwesome,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { loginWithEmail, loginWithGoogle, clearError } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

// ─── Animated floating particle ─────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        animation: 'float-up linear infinite',
        '@keyframes float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 0.6 },
          '100%': { transform: 'translateY(-100vh) scale(0.5)', opacity: 0 },
        },
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

// ─── Feature bullet ──────────────────────────────────────────────────────────
function Bullet({ text }: { text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
      <CheckCircle sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{text}</Typography>
    </Box>
  );
}

// ─── Input field wrapper with focus glow ────────────────────────────────────
function GlowField({
  id, label, type, value, onChange, error, helperText,
  icon, endAdornment, autoComplete,
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
          opacity: focused ? 0.35 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(4px)',
        }}
      />
      <TextField
        id={id}
        label={label}
        type={type}
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        error={error}
        helperText={helperText}
        autoComplete={autoComplete}
        required
        sx={{
          position: 'relative', zIndex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            background: '#fff',
            '& fieldset': { borderColor: error ? '#ef4444' : 'rgba(8,145,178,0.25)', borderWidth: '1.5px' },
            '&:hover fieldset': { borderColor: 'rgba(8,145,178,0.55)' },
            '&.Mui-focused fieldset': { borderColor: '#0891b2', borderWidth: '2px' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#0891b2' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ color: focused ? '#0891b2' : '#94a3b8', transition: 'color 0.25s', display: 'flex' }}>
                {icon}
              </Box>
            </InputAdornment>
          ),
          endAdornment,
        }}
      />
    </Box>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Clear error when inputs change
  useEffect(() => { if (error) dispatch(clearError()); }, [email, password]);

  // Validate email in real-time
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) { triggerShake(); return; }
    dispatch(clearError());
    try {
      await dispatch(loginWithEmail({ email, password })).unwrap();
      setSuccess(true);
      toast.success('Welcome back! 🎉');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      triggerShake();
      toast.error(err || 'Login failed');
    }
  };

  const handleGoogle = async () => {
    dispatch(clearError());
    try {
      await dispatch(loginWithGoogle()).unwrap();
      setSuccess(true);
      toast.success('Welcome! 🎉');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      toast.error(err || 'Google login failed');
    }
  };

  // Particles config
  const particles = [
    { width: 12, height: 12, left: '15%', animationDuration: '8s', animationDelay: '0s' },
    { width: 8, height: 8, left: '30%', animationDuration: '12s', animationDelay: '2s' },
    { width: 16, height: 16, left: '50%', animationDuration: '9s', animationDelay: '4s' },
    { width: 6, height: 6, left: '70%', animationDuration: '11s', animationDelay: '1s' },
    { width: 10, height: 10, left: '85%', animationDuration: '7s', animationDelay: '3s' },
    { width: 14, height: 14, left: '5%', animationDuration: '14s', animationDelay: '5s' },
    { width: 7, height: 7, left: '92%', animationDuration: '10s', animationDelay: '0.5s' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fafc',
        '@keyframes shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-8px)' },
          '30%': { transform: 'translateX(8px)' },
          '45%': { transform: 'translateX(-6px)' },
          '60%': { transform: 'translateX(6px)' },
          '75%': { transform: 'translateX(-3px)' },
          '90%': { transform: 'translateX(3px)' },
        },
        '@keyframes slide-in-left': {
          from: { opacity: 0, transform: 'translateX(-40px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes slide-in-right': {
          from: { opacity: 0, transform: 'translateX(40px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: 0.4 },
          '100%': { transform: 'scale(1.6)', opacity: 0 },
        },
        '@keyframes bounce-in': {
          '0%': { transform: 'scale(0)', opacity: 0 },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      }}
    >
      {/* ── Left panel (branding) ────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 45%',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #0891b2 0%, #0d9488 55%, #0e7490 100%)',
          animation: 'slide-in-left 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
          p: 6,
        }}
      >
        {/* Animated particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={{ width: p.width, height: p.height, left: p.left, bottom: '-10%', animationDuration: p.animationDuration, animationDelay: p.animationDelay }} />
        ))}

        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex' }}>
              <School sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>SDLMS</Typography>
          </Box>

          <Chip
            icon={<AutoAwesome sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.9) !important' }} />}
            label="Smart Digital LMS"
            size="small"
            sx={{ mb: 3, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', fontWeight: 600 }}
          />

          <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2, mb: 2, fontSize: '2rem' }}>
            Welcome back to your learning journey
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mb: 5, lineHeight: 1.8 }}>
            Sign in to access courses, track progress, and continue where you left off.
          </Typography>

          <Box>
            <Bullet text="Access all your enrolled courses instantly" />
            <Bullet text="Track learning progress in real-time" />
            <Bullet text="Connect with instructors & peers" />
            <Bullet text="Earn certifications & achievements" />
          </Box>

          {/* Testimonial pill */}
          <Box sx={{ mt: 6, p: 2.5, borderRadius: 3, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', fontStyle: 'italic', lineHeight: 1.7, mb: 1.5 }}>
              "SDLMS completely changed how I manage learning across our 8 faculties. Incredible platform."
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>A</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, display: 'block' }}>Dr. Amara Nwosu</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>University Admin · Tech Univ.</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Right panel (form) ───────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
          overflowY: 'auto',
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

          {/* Heading */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5 }}>
              Sign in
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" style={{ color: '#0891b2', fontWeight: 600, textDecoration: 'none' }}>
                Create one free →
              </Link>
            </Typography>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => dispatch(clearError())}
              sx={{ mb: 3, borderRadius: 2, animation: 'bounce-in 0.4s ease forwards', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              {error}
            </Alert>
          )}

          {/* Success overlay */}
          {success && (
            <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 1.5, animation: 'bounce-in 0.4s ease forwards' }}>
              <CheckCircle sx={{ color: '#10b981', fontSize: 22 }} />
              <Typography variant="body2" fontWeight={600} sx={{ color: '#065f46' }}>Login successful! Redirecting…</Typography>
            </Box>
          )}

          {/* Form */}
          <Box
            ref={formRef}
            component="form"
            onSubmit={handleLogin}
            sx={{ animation: shake ? 'shake 0.6s ease forwards' : 'none' }}
          >
            <GlowField
              id="login-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              error={Boolean(emailError)}
              helperText={emailError}
              icon={<Email sx={{ fontSize: 20 }} />}
              autoComplete="email"
            />

            <GlowField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              icon={<Lock sx={{ fontSize: 20 }} />}
              autoComplete="current-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    id="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#94a3b8', '&:hover': { color: '#0891b2' }, transition: 'color 0.2s' }}
                  >
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              }
            />

            {/* Forgot password */}
            <Box sx={{ textAlign: 'right', mt: -1.5, mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#0891b2', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                Forgot password?
              </Typography>
            </Box>

            {/* Submit button */}
            <Box sx={{ position: 'relative' }}>
              {/* Pulse ring on idle */}
              {!loading && !success && email && password && !emailError && (
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '12px', border: '2px solid rgba(8,145,178,0.4)', animation: 'pulse-ring 1.5s ease-out infinite', pointerEvents: 'none' }} />
              )}
              <Button
                id="login-submit-btn"
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
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0e7490, #0f766e)',
                    boxShadow: '0 12px 32px rgba(8,145,178,0.48)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'translateY(0px)' },
                  '&.Mui-disabled': { background: 'rgba(8,145,178,0.4)', color: 'rgba(255,255,255,0.7)' },
                }}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  : success
                    ? '✓ Signed In!'
                    : 'Sign In'}
              </Button>
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(8,145,178,0.15)' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>OR</Typography>
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(8,145,178,0.15)' }} />
          </Box>

          {/* Google button */}
          <Button
            id="google-login-btn"
            variant="outlined"
            fullWidth
            size="large"
            onClick={handleGoogle}
            disabled={loading || success}
            sx={{
              py: 1.5, borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
              borderColor: 'rgba(8,145,178,0.25)', color: '#334155',
              background: '#fff',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: '#0891b2',
                background: 'rgba(8,145,178,0.04)',
                boxShadow: '0 4px 16px rgba(8,145,178,0.12)',
                transform: 'translateY(-1px)',
              },
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

          {/* Footer note */}
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', mt: 4, lineHeight: 1.7 }}>
            By signing in, you agree to our{' '}
            <Box component="span" sx={{ color: '#0891b2', cursor: 'pointer', fontWeight: 600 }}>Terms</Box>
            {' & '}
            <Box component="span" sx={{ color: '#0891b2', cursor: 'pointer', fontWeight: 600 }}>Privacy Policy</Box>
          </Typography>

          {/* Back to home */}
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
