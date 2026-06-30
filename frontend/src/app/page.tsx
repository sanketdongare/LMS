'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Container, Typography, Grid, Card, CardContent,
  Avatar, Chip, Tab, Tabs, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  School, People, MenuBook, TrendingUp, CheckCircle, Star,
  AdminPanelSettings, AccountBalance, PlayArrow, ArrowForward,
  AutoGraph, Security, Speed, Devices, Groups, EmojiEvents,
  KeyboardArrowDown, Bolt, WorkspacePremium, Verified,
  NotificationsActive, BarChart, Quiz, Assignment,
  Psychology, Rocket, FilterList, Search,
} from '@mui/icons-material';

// ─── Animated Counter ──────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1800;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Scroll Fade In ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Typing Text ───────────────────────────────────────────────────────────
function TypingText({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const word = words[wordIdx];
    const speed = deleting ? 60 : 100;
    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), 1400);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words]);

  return (
    <Box component="span" sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {display}
      <Box component="span" sx={{ WebkitTextFillColor: '#0891b2', animation: 'blink 0.8s step-end infinite', '@keyframes blink': { '50%': { opacity: 0 } } }}>|</Box>
    </Box>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, gradient, badge }: { icon: React.ReactNode; title: string; desc: string; gradient: string; badge?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%', border: '1px solid rgba(8,145,178,0.12)', background: '#fff',
        borderRadius: 3, transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 24px 56px rgba(8,145,178,0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
        borderColor: hovered ? 'rgba(8,145,178,0.35)' : 'rgba(8,145,178,0.12)',
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        {badge && <Chip label={badge} size="small" sx={{ mb: 1.5, fontSize: '0.65rem', height: 20, background: 'rgba(8,145,178,0.1)', color: '#0891b2', fontWeight: 700 }} />}
        <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, transition: 'transform 0.3s', transform: hovered ? 'rotate(5deg) scale(1.1)' : 'none' }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>{desc}</Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: '#0891b2', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <Typography variant="caption" fontWeight={600}>Learn more</Typography>
          <ArrowForward sx={{ fontSize: 12 }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Interactive Role Demo ─────────────────────────────────────────────────
const roleDemos = {
  admin: {
    color: '#7c3aed', label: 'LMS Admin', icon: <AdminPanelSettings />,
    stats: [{ l: 'Universities', v: '24' }, { l: 'Total Users', v: '48,291' }, { l: 'Active Courses', v: '1,240' }, { l: 'System Health', v: '99.9%' }],
    actions: ['Manage Universities', 'View System Analytics', 'Configure Roles', 'Audit Logs'],
    description: 'Full system control — manage every university, institute, and user from a single command center.',
  },
  university: {
    color: '#0891b2', label: 'University Admin', icon: <School />,
    stats: [{ l: 'Institutes', v: '12' }, { l: 'Instructors', v: '340' }, { l: 'Students', v: '8,420' }, { l: 'Courses', v: '186' }],
    actions: ['Manage Institutes', 'Assign Instructors', 'View Reports', 'Manage Programs'],
    description: 'Oversee your entire university — from institutes and programs to performance analytics.',
  },
  instructor: {
    color: '#0d9488', label: 'Instructor', icon: <People />,
    stats: [{ l: 'My Courses', v: '6' }, { l: 'Enrolled', v: '312' }, { l: 'Avg. Score', v: '84%' }, { l: 'Completion', v: '79%' }],
    actions: ['Create Course', 'Grade Assignments', 'Send Notifications', 'View Analytics'],
    description: 'Build engaging courses, track student progress, and communicate with your class in real-time.',
  },
  student: {
    color: '#f59e0b', label: 'Student', icon: <EmojiEvents />,
    stats: [{ l: 'Enrolled', v: '4' }, { l: 'Completed', v: '7' }, { l: 'Avg. Grade', v: '91%' }, { l: 'Certificates', v: '3' }],
    actions: ['Browse Catalog', 'Continue Learning', 'Take Quiz', 'View Certificate'],
    description: 'Track your learning journey, earn certificates, and achieve your academic goals.',
  },
};

function RoleDemoPanel() {
  const [active, setActive] = useState<keyof typeof roleDemos>('admin');
  const demo = roleDemos[active];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const t = setTimeout(() => setProgress(78), 300);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(8,145,178,0.15)', boxShadow: '0 24px 64px rgba(8,145,178,0.12)' }}>
      {/* Tab bar */}
      <Box sx={{ background: '#0f172a', display: 'flex', overflowX: 'auto' }}>
        {(Object.keys(roleDemos) as (keyof typeof roleDemos)[]).map((key) => {
          const r = roleDemos[key];
          return (
            <Box
              key={key}
              onClick={() => setActive(key)}
              sx={{
                px: 2.5, py: 1.8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
                borderBottom: active === key ? `2px solid ${r.color}` : '2px solid transparent',
                background: active === key ? `${r.color}15` : 'transparent',
                transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              <Box sx={{ color: active === key ? r.color : '#64748b', display: 'flex', fontSize: 18 }}>{r.icon}</Box>
              <Typography variant="caption" fontWeight={600} sx={{ color: active === key ? '#fff' : '#64748b', whiteSpace: 'nowrap' }}>{r.label}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Content */}
      <Box sx={{ background: '#fff', p: 3 }}>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.7 }}>{demo.description}</Typography>

        {/* Stats */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {demo.stats.map((s) => (
            <Grid item xs={6} key={s.l}>
              <Box sx={{ p: 1.5, borderRadius: 2, background: `${demo.color}08`, border: `1px solid ${demo.color}20` }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{s.l}</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: demo.color, lineHeight: 1.3 }}>{s.v}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Progress bar */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Platform Activity</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: demo.color }}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6, borderRadius: 3, background: `${demo.color}15`,
              '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${demo.color}, ${demo.color}aa)`, borderRadius: 3, transition: 'transform 1s ease-in-out' },
            }}
          />
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {demo.actions.map((a, i) => (
            <Chip
              key={a}
              label={a}
              size="small"
              clickable
              sx={{
                background: i === 0 ? demo.color : `${demo.color}12`,
                color: i === 0 ? '#fff' : demo.color,
                fontWeight: 600, fontSize: '0.72rem',
                '&:hover': { background: demo.color, color: '#fff' },
                transition: 'all 0.2s',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Course Catalog Preview ────────────────────────────────────────────────
const allCourses = [
  { title: 'Machine Learning Fundamentals', cat: 'AI & Data', enrolled: 2341, rating: 4.9, level: 'Advanced', color: '#7c3aed' },
  { title: 'Full-Stack Web Development', cat: 'Engineering', enrolled: 3120, rating: 4.8, level: 'Intermediate', color: '#0891b2' },
  { title: 'Data Structures & Algorithms', cat: 'CS Core', enrolled: 1876, rating: 4.7, level: 'Intermediate', color: '#0d9488' },
  { title: 'UI/UX Design Principles', cat: 'Design', enrolled: 1540, rating: 4.8, level: 'Beginner', color: '#ec4899' },
  { title: 'Cloud Architecture with AWS', cat: 'Cloud', enrolled: 987, rating: 4.6, level: 'Advanced', color: '#f59e0b' },
  { title: 'Business Analytics', cat: 'Business', enrolled: 1200, rating: 4.5, level: 'Beginner', color: '#06b6d4' },
];

function CourseCatalogPreview() {
  const [filter, setFilter] = useState('All');
  const cats = ['All', 'AI & Data', 'Engineering', 'Design', 'Cloud'];
  const filtered = filter === 'All' ? allCourses : allCourses.filter(c => c.cat === filter);

  return (
    <Box>
      {/* Filter chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <Chip
            key={c}
            label={c}
            onClick={() => setFilter(c)}
            size="small"
            sx={{
              fontWeight: 600, cursor: 'pointer',
              background: filter === c ? 'linear-gradient(135deg, #0891b2, #0d9488)' : 'rgba(8,145,178,0.08)',
              color: filter === c ? '#fff' : '#0891b2',
              border: `1px solid ${filter === c ? 'transparent' : 'rgba(8,145,178,0.2)'}`,
              '&:hover': { background: 'linear-gradient(135deg, #0891b2, #0d9488)', color: '#fff' },
              transition: 'all 0.2s',
            }}
          />
        ))}
      </Box>

      {/* Course cards */}
      <Grid container spacing={2}>
        {filtered.map((course) => (
          <Grid item xs={12} sm={6} key={course.title}>
            <Card sx={{
              border: '1px solid rgba(8,145,178,0.1)', borderRadius: 2.5,
              transition: 'all 0.25s', cursor: 'pointer',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${course.color}20`, borderColor: `${course.color}40` },
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, background: `${course.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MenuBook sx={{ color: course.color, fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a', lineHeight: 1.3, mb: 0.5 }} noWrap>{course.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip label={course.level} size="small" sx={{ height: 18, fontSize: '0.6rem', background: `${course.color}15`, color: course.color, fontWeight: 700 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Star sx={{ fontSize: 11, color: '#f59e0b' }} />
                        <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>{course.rating}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>{course.enrolled.toLocaleString()} enrolled</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Button component={Link} href="/auth/register" size="small" variant="outlined"
          sx={{ borderColor: 'rgba(8,145,178,0.35)', color: '#0891b2', fontWeight: 600, borderRadius: 2, '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.06)' } }}>
          Browse All 12,000+ Courses →
        </Button>
      </Box>
    </Box>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, university, text, avatar, color }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%', borderRadius: 3, border: `1px solid ${color}22`,
        background: hovered ? `linear-gradient(135deg, ${color}06, #fff)` : '#fff',
        transition: 'all 0.3s', transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 16px 40px ${color}20` : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 0.3, mb: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} sx={{ fontSize: 16, color: '#f59e0b' }} />)}
        </Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.8, fontStyle: 'italic' }}>"{text}"</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontWeight: 700, fontSize: '1rem' }}>{avatar}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>{name}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>{role} · {university}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(8,145,178,0.15)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(8,145,178,0.08)' : 'none',
          px: { xs: 2, md: 4 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.3s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ p: 0.8, borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #0d9488)', display: 'flex', boxShadow: '0 4px 12px rgba(8,145,178,0.35)' }}>
            <School sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SDLMS
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5, alignItems: 'center' }}>
          {['Features', 'Demo', 'Courses', 'Testimonials'].map((item) => (
            <Box key={item} component="a" href={`#${item.toLowerCase()}`}
              sx={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', '&:hover': { color: '#0891b2' }, transition: 'color 0.2s' }}>
              {item}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button component={Link} href="/auth/login" variant="outlined" size="small"
            sx={{ borderColor: 'rgba(8,145,178,0.4)', color: '#0891b2', fontWeight: 600, borderRadius: 2, '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.06)' } }}>
            Sign In
          </Button>
          <Button component={Link} href="/auth/register" variant="contained" size="small"
            sx={{ borderRadius: 2, fontWeight: 600, background: 'linear-gradient(135deg, #0891b2, #0d9488)', boxShadow: '0 4px 15px rgba(8,145,178,0.3)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }}>
            Get Started
          </Button>
        </Box>
      </Box>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(8,145,178,0.09) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(13,148,136,0.08) 0%, transparent 50%), #f8fafc',
        pt: 12, pb: 8, position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated blobs */}
        <Box sx={{ position: 'absolute', top: 80, right: -80, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)', animation: 'float1 8s ease-in-out infinite', '@keyframes float1': { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(-20px, 20px) scale(1.05)' } }, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 40, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)', animation: 'float2 10s ease-in-out infinite', '@keyframes float2': { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(20px, -20px) scale(1.08)' } }, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '40%', left: '45%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', animation: 'float1 12s ease-in-out infinite reverse', pointerEvents: 'none' }} />

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              {/* Badge */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<Bolt sx={{ fontSize: 14 }} />} label="Next-gen LMS Platform" size="small"
                  sx={{ background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
                <Chip icon={<Verified sx={{ fontSize: 14 }} />} label="Trusted by 500+ institutions" size="small"
                  sx={{ background: 'rgba(13,148,136,0.10)', color: '#0d9488', fontWeight: 600, border: '1px solid rgba(13,148,136,0.2)', borderRadius: 10 }} />
              </Box>

              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.15, mb: 2.5, fontSize: { xs: '2.2rem', md: '3.1rem' }, color: '#0f172a' }}>
                The Smarter Way to{' '}<br />
                <TypingText words={['Manage Learning', 'Deliver Courses', 'Track Progress', 'Grow Institutions']} />
              </Typography>

              <Typography variant="body1" sx={{ color: '#475569', mb: 4, lineHeight: 1.85, fontSize: '1.05rem', maxWidth: 480 }}>
                SDLMS is a powerful, multi-tenant learning management system built for universities, institutes, instructors, and students — all in one seamless platform.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                <Button component={Link} href="/auth/register" variant="contained" size="large" endIcon={<Rocket sx={{ fontSize: 18 }} />}
                  sx={{ borderRadius: 2.5, fontWeight: 700, px: 3.5, py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #0891b2, #0d9488)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)', boxShadow: '0 12px 32px rgba(8,145,178,0.45)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
                  Start for Free
                </Button>
                <Button component={Link} href="#demo" variant="outlined" size="large" startIcon={<PlayArrow />}
                  sx={{ borderRadius: 2.5, fontWeight: 600, px: 3, py: 1.5, borderColor: 'rgba(8,145,178,0.35)', color: '#0891b2', '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.06)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
                  Live Demo
                </Button>
              </Box>

              {/* Trust row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', '& > *:not(:first-of-type)': { ml: -1 } }}>
                  {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                    <Avatar key={l} sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, border: '2px solid #f8fafc', background: ['#0891b2', '#0d9488', '#06b6d4', '#14b8a6', '#7c3aed'][i] }}>{l}</Avatar>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Trusted by <strong style={{ color: '#0891b2' }}>500+</strong> institutions worldwide
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} sx={{ fontSize: 14, color: '#f59e0b' }} />)}
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>4.9/5</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Hero visual */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(8,145,178,0.15)', boxShadow: '0 32px 80px rgba(8,145,178,0.18)', overflow: 'hidden' }}>
                  <Box sx={{ background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    <Box sx={{ flex: 1, mx: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 10, px: 1.5, py: 0.4 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>sdlms.edu/dashboard</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3, background: '#ffffff' }}>
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                      {[
                        { label: 'Universities', value: '24', color: '#0891b2' },
                        { label: 'Institutes', value: '180', color: '#0d9488' },
                        { label: 'Courses', value: '1.2k', color: '#06b6d4' },
                        { label: 'Students', value: '48k', color: '#14b8a6' },
                      ].map((s) => (
                        <Grid item xs={6} key={s.label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, background: `${s.color}09`, border: `1px solid ${s.color}20`, transition: 'all 0.2s', '&:hover': { background: `${s.color}15`, transform: 'scale(1.02)' }, cursor: 'default' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{s.label}</Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ color: s.color, lineHeight: 1.3 }}>{s.value}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    {['Introduction to Machine Learning', 'Full-Stack Web Dev', 'Data Structures & Algorithms'].map((c, i) => (
                      <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, borderRadius: 1.5, mb: 1, cursor: 'pointer', background: i === 0 ? 'rgba(8,145,178,0.06)' : 'transparent', border: i === 0 ? '1px solid rgba(8,145,178,0.12)' : '1px solid transparent', '&:hover': { background: 'rgba(8,145,178,0.08)', borderColor: 'rgba(8,145,178,0.2)' }, transition: 'all 0.2s' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: ['#0891b2', '#0d9488', '#06b6d4'][i], flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: i === 0 ? 600 : 400, flex: 1 }}>{c}</Typography>
                        <Chip label={['Active', 'Draft', 'Active'][i]} size="small" color={i === 1 ? 'default' : 'success'} sx={{ height: 18, fontSize: '0.6rem' }} />
                      </Box>
                    ))}
                  </Box>
                </Card>

                {/* Floating badges */}
                <Box sx={{ position: 'absolute', top: -20, right: -16, background: '#fff', border: '1px solid rgba(8,145,178,0.15)', borderRadius: 2.5, p: 1.5, boxShadow: '0 8px 24px rgba(8,145,178,0.12)', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, animation: 'float1 6s ease-in-out infinite' }}>
                  <EmojiEvents sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>Top Rated</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>LMS Platform 2025</Typography>
                  </Box>
                </Box>
                <Box sx={{ position: 'absolute', bottom: -16, left: -16, background: '#fff', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 2.5, p: 1.5, boxShadow: '0 8px 24px rgba(13,148,136,0.12)', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, animation: 'float2 7s ease-in-out infinite' }}>
                  <NotificationsActive sx={{ color: '#0d9488', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>New Enrollment!</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>ML Course · 2s ago</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Scroll cue */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, animation: 'bounce 2s ease-in-out infinite', '@keyframes bounce': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(8px)' } }, cursor: 'pointer' }} onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>Scroll to explore</Typography>
              <KeyboardArrowDown sx={{ color: '#94a3b8', fontSize: 24 }} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Animated Stats ──────────────────────────────────────────────── */}
      <Box id="stats" sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {[
              { target: 500, suffix: '+', label: 'Institutions', icon: <AccountBalance sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
              { target: 48000, suffix: '+', label: 'Active Students', icon: <People sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
              { target: 12000, suffix: '+', label: 'Courses Offered', icon: <MenuBook sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
              { target: 99, suffix: '.9%', label: 'Uptime Guarantee', icon: <Speed sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
            ].map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{s.icon}</Box>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5, fontWeight: 500 }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Chip label="⚡ Platform Features" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
              <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                Everything you need in one place
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 520, mx: 'auto', lineHeight: 1.8 }}>
                From multi-university hierarchy to real-time analytics — SDLMS has every tool your institution needs.
              </Typography>
            </Box>
          </FadeIn>

          <Grid container spacing={3}>
            {[
              { icon: <AutoGraph sx={{ color: '#0891b2', fontSize: 24 }} />, title: 'Real-Time Analytics', desc: 'Gain instant insights into enrollment trends, course completion rates, and learner performance across every level.', gradient: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(8,145,178,0.05))', badge: 'Popular' },
              { icon: <Groups sx={{ color: '#0d9488', fontSize: 24 }} />, title: 'Multi-Role Management', desc: 'Distinct dashboards for LMS Admins, University Admins, Instructors, and Students — each tailored to their needs.', gradient: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.05))' },
              { icon: <Security sx={{ color: '#06b6d4', fontSize: 24 }} />, title: 'Enterprise Security', desc: 'Role-based access control, JWT authentication, and encrypted data storage keep your platform safe.', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))' },
              { icon: <Devices sx={{ color: '#14b8a6', fontSize: 24 }} />, title: 'Fully Responsive', desc: 'Optimized for desktop, tablet, and mobile. Students can learn from any device, anywhere, at any time.', gradient: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.05))' },
              { icon: <Quiz sx={{ color: '#0891b2', fontSize: 24 }} />, title: 'Rich Assessments', desc: 'Create quizzes, assignments, and exams with instant grading, detailed feedback, and performance tracking.', gradient: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(8,145,178,0.05))', badge: 'New' },
              { icon: <TrendingUp sx={{ color: '#0d9488', fontSize: 24 }} />, title: 'Progress Tracking', desc: 'Students and instructors can track completion milestones, quiz scores, and certification achievements in real time.', gradient: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.05))' },
            ].map((f, i) => (
              <Grid item xs={12} sm={6} lg={4} key={f.title}>
                <FadeIn delay={i * 80}>
                  <FeatureCard {...f} />
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Interactive Role Demo ────────────────────────────────────────── */}
      <Box id="demo" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <FadeIn>
                <Chip label="🎭 Interactive Demo" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
                <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                  Explore each role's dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, mb: 3 }}>
                  Click any role tab to see exactly what each user experiences — real stats, actions, and workflows tailored to their responsibilities.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { icon: <WorkspacePremium sx={{ fontSize: 18, color: '#7c3aed' }} />, text: 'Switch between 4 distinct role views' },
                    { icon: <BarChart sx={{ fontSize: 18, color: '#0891b2' }} />, text: 'Live metrics and progress indicators' },
                    { icon: <Assignment sx={{ fontSize: 18, color: '#0d9488' }} />, text: 'Role-specific actions and workflows' },
                  ].map(({ icon, text }) => (
                    <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(8,145,178,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</Box>
                      <Typography variant="body2" sx={{ color: '#475569' }}>{text}</Typography>
                    </Box>
                  ))}
                </Box>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={7}>
              <FadeIn delay={150}>
                <RoleDemoPanel />
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Course Catalog Preview ───────────────────────────────────────── */}
      <Box id="courses" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="flex-start">
            <Grid item xs={12} md={7}>
              <FadeIn>
                <CourseCatalogPreview />
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={5}>
              <FadeIn delay={100}>
                <Chip label="📚 Course Catalog" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
                <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                  12,000+ courses across every discipline
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, mb: 3 }}>
                  From AI and engineering to design and business — instructors publish courses that students can access from any device, at any time.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {['Filter by category, level, and rating', 'Self-paced & live instructor-led modes', 'Earn verifiable digital certificates', 'Track progress with milestone badges'].map(p => (
                    <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <CheckCircle sx={{ fontSize: 18, color: '#0891b2' }} />
                      <Typography variant="body2" sx={{ color: '#475569' }}>{p}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button component={Link} href="/auth/register" variant="contained" sx={{ mt: 3.5, borderRadius: 2.5, fontWeight: 700, background: 'linear-gradient(135deg, #0891b2, #0d9488)', boxShadow: '0 6px 20px rgba(8,145,178,0.3)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }} endIcon={<ArrowForward />}>
                  Browse Catalog
                </Button>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <Box id="testimonials" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Chip label="💬 What People Say" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
              <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                Loved by educators & learners
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={3}>
            {[
              { name: 'Dr. Amara Nwosu', role: 'University Admin', university: 'Tech Univ.', text: 'SDLMS transformed how we manage our 12 faculties. The role-based dashboards are intuitive and the analytics are superb.', avatar: 'A', color: '#7c3aed' },
              { name: 'James Kalinda', role: 'Instructor', university: 'STEM Institute', text: 'Creating and publishing courses takes minutes. My students love the clean interface and the progress tracking keeps them motivated.', avatar: 'J', color: '#0891b2' },
              { name: 'Priya Sharma', role: 'Student', university: 'Global College', text: 'I can study from my phone, laptop, or tablet seamlessly. The dashboard shows exactly where I am and what I need to complete.', avatar: 'P', color: '#0d9488' },
            ].map((t, i) => (
              <Grid item xs={12} md={4} key={t.name}>
                <FadeIn delay={i * 100}>
                  <TestimonialCard {...t} />
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'float1 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -40, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', animation: 'float2 10s ease-in-out infinite', pointerEvents: 'none' }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2, fontSize: { xs: '1.8rem', md: '2.6rem' } }}>
            Ready to transform your institution?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)', mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}>
            Join hundreds of universities already using SDLMS to deliver world-class education — free to start.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} href="/auth/register" variant="contained" size="large" endIcon={<Rocket />}
              sx={{ borderRadius: 2.5, fontWeight: 700, px: 4, py: 1.6, fontSize: '1rem', background: '#ffffff', color: '#0891b2', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', '&:hover': { background: '#f0f9ff', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
              Create Free Account
            </Button>
            <Button component={Link} href="/auth/login" variant="outlined" size="large"
              sx={{ borderRadius: 2.5, fontWeight: 600, px: 3.5, py: 1.6, borderColor: 'rgba(255,255,255,0.5)', color: '#fff', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Box component="footer" sx={{ background: '#0f172a', py: 5, px: { xs: 3, md: 4 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Box sx={{ p: 0.8, borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #0d9488)', display: 'flex' }}>
                  <School sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>SDLMS</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.8, maxWidth: 280 }}>
                Smart Digital Learning Management System — empowering education through technology.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>Platform</Typography>
              {['Features', 'Pricing', 'Security', 'Docs'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: '#64748b', mb: 1, cursor: 'pointer', '&:hover': { color: '#22d3ee' }, transition: 'color 0.2s' }}>{l}</Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>Roles</Typography>
              {['LMS Admin', 'University Admin', 'Instructor', 'Student'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: '#64748b', mb: 1, cursor: 'pointer', '&:hover': { color: '#22d3ee' }, transition: 'color 0.2s' }}>{l}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>Get Started Today</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2, lineHeight: 1.7 }}>Create your institution's account and start delivering courses in minutes.</Typography>
              <Button component={Link} href="/auth/register" variant="contained" size="small"
                sx={{ borderRadius: 2, fontWeight: 600, background: 'linear-gradient(135deg, #0891b2, #0d9488)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }}>
                Register Now
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.07)', pt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#475569' }}>© 2025 SDLMS. All rights reserved.</Typography>
            <Typography variant="caption" sx={{ color: '#475569' }}>Built with ❤️ for modern education</Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
