'use client';
import Link from 'next/link';
import { Box, Button, Container, Typography, Grid, Card, CardContent, Avatar, Chip } from '@mui/material';
import {
  School, People, MenuBook, TrendingUp, CheckCircle, Star,
  AdminPanelSettings, AccountBalance, PlayArrow, ArrowForward,
  AutoGraph, Security, Speed, Devices, Groups, EmojiEvents,
} from '@mui/icons-material';

// ─── Feature Card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, gradient }: { icon: React.ReactNode; title: string; desc: string; gradient: string }) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid rgba(8,145,178,0.12)',
        background: '#fff',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 48px rgba(8,145,178,0.15)',
          borderColor: 'rgba(8,145,178,0.35)',
        },
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0f172a' }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>{desc}</Typography>
      </CardContent>
    </Card>
  );
}

// ─── Stat Box ───────────────────────────────────────────────────────────────
function StatBox({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center', px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{icon}</Box>
      <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

// ─── Role Card ───────────────────────────────────────────────────────────────
function RoleCard({ icon, role, color, desc, perks }: { icon: React.ReactNode; role: string; color: string; desc: string; perks: string[] }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${color}22`,
        background: `linear-gradient(135deg, ${color}08 0%, #ffffff 100%)`,
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 40px ${color}20`, borderColor: `${color}44` },
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#0f172a' }}>{role}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.7 }}>{desc}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {perks.map((p) => (
            <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 15, color }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>{p}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Testimonial Card ────────────────────────────────────────────────────────
function TestimonialCard({ name, role, university, text, avatar }: { name: string; role: string; university: string; text: string; avatar: string }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid rgba(8,145,178,0.12)', background: '#fff', p: 0.5 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 0.3, mb: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} sx={{ fontSize: 16, color: '#f59e0b' }} />)}
        </Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.8, fontStyle: 'italic' }}>"{text}"</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0891b2, #0d9488)', fontWeight: 700, fontSize: '1rem' }}>
            {avatar}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>{name}</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>{role} · {university}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(8,145,178,0.12)',
          px: { xs: 2, md: 4 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ p: 0.8, borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #0d9488)', display: 'flex' }}>
            <School sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SDLMS
          </Typography>
        </Box>

        {/* Nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5, alignItems: 'center' }}>
          {['Features', 'Roles', 'Testimonials'].map((item) => (
            <Box
              key={item}
              component="a"
              href={`#${item.toLowerCase()}`}
              sx={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', '&:hover': { color: '#0891b2' }, transition: 'color 0.2s' }}
            >
              {item}
            </Box>
          ))}
        </Box>

        {/* Auth buttons */}
        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button
            component={Link}
            href="/auth/login"
            variant="outlined"
            size="small"
            sx={{ borderColor: 'rgba(8,145,178,0.4)', color: '#0891b2', fontWeight: 600, borderRadius: 2, '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.06)' } }}
          >
            Sign In
          </Button>
          <Button
            component={Link}
            href="/auth/register"
            variant="contained"
            size="small"
            sx={{ borderRadius: 2, fontWeight: 600, background: 'linear-gradient(135deg, #0891b2, #0d9488)', boxShadow: '0 4px 15px rgba(8,145,178,0.3)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(8,145,178,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(13,148,136,0.07) 0%, transparent 50%), #f8fafc',
          pt: 10, pb: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: 80, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 40, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left copy */}
            <Grid item xs={12} md={6}>
              <Chip
                label="🎓 Multi-University LMS Platform"
                size="small"
                sx={{ mb: 3, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.15,
                  mb: 2.5,
                  fontSize: { xs: '2.2rem', md: '3rem' },
                  color: '#0f172a',
                }}
              >
                The Smarter Way to{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Manage Learning
                </Box>
              </Typography>

              <Typography variant="body1" sx={{ color: '#475569', mb: 4, lineHeight: 1.85, fontSize: '1.05rem', maxWidth: 480 }}>
                SDLMS is a powerful, multi-tenant learning management system built for universities, institutes, instructors, and students — all in one seamless platform.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    borderRadius: 2.5, fontWeight: 700, px: 3.5, py: 1.5, fontSize: '1rem',
                    background: 'linear-gradient(135deg, #0891b2, #0d9488)',
                    boxShadow: '0 8px 24px rgba(8,145,178,0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)', boxShadow: '0 12px 32px rgba(8,145,178,0.45)' },
                  }}
                >
                  Start for Free
                </Button>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{
                    borderRadius: 2.5, fontWeight: 600, px: 3, py: 1.5,
                    borderColor: 'rgba(8,145,178,0.35)', color: '#0891b2',
                    '&:hover': { borderColor: '#0891b2', background: 'rgba(8,145,178,0.06)' },
                  }}
                >
                  Sign In
                </Button>
              </Box>

              {/* Trust row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', '& > *:not(:first-of-type)': { ml: -1 } }}>
                  {['A', 'B', 'C', 'D'].map((l, i) => (
                    <Avatar key={l} sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, border: '2px solid #f8fafc', background: ['#0891b2', '#0d9488', '#06b6d4', '#14b8a6'][i] }}>{l}</Avatar>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Trusted by <strong style={{ color: '#0891b2' }}>500+</strong> institutions worldwide
                </Typography>
              </Box>
            </Grid>

            {/* Right visual card */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                {/* Main dashboard preview card */}
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(8,145,178,0.15)', boxShadow: '0 32px 80px rgba(8,145,178,0.18)', overflow: 'hidden' }}>
                  {/* Fake browser bar */}
                  <Box sx={{ background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)', px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    <Box sx={{ flex: 1, mx: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 10, px: 1.5, py: 0.4 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>sdlms.edu/dashboard</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 3, background: '#ffffff' }}>
                    {/* Fake stat row */}
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                      {[
                        { label: 'Universities', value: '24', color: '#0891b2' },
                        { label: 'Institutes', value: '180', color: '#0d9488' },
                        { label: 'Courses', value: '1.2k', color: '#06b6d4' },
                        { label: 'Students', value: '48k', color: '#14b8a6' },
                      ].map((s) => (
                        <Grid item xs={6} key={s.label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, background: `${s.color}09`, border: `1px solid ${s.color}20` }}>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{s.label}</Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ color: s.color, lineHeight: 1.3 }}>{s.value}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Fake course list */}
                    {['Introduction to Machine Learning', 'Full-Stack Web Dev', 'Data Structures & Algorithms'].map((c, i) => (
                      <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, borderRadius: 1.5, mb: 1, background: i === 0 ? 'rgba(8,145,178,0.06)' : 'transparent', border: i === 0 ? '1px solid rgba(8,145,178,0.12)' : '1px solid transparent' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: ['#0891b2', '#0d9488', '#06b6d4'][i], flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: i === 0 ? 600 : 400, flex: 1 }}>{c}</Typography>
                        <Chip label={['Active', 'Draft', 'Active'][i]} size="small" color={i === 1 ? 'default' : 'success'} sx={{ height: 18, fontSize: '0.6rem' }} />
                      </Box>
                    ))}
                  </Box>
                </Card>

                {/* Floating badge 1 */}
                <Box sx={{ position: 'absolute', top: -20, right: -16, background: '#fff', border: '1px solid rgba(8,145,178,0.15)', borderRadius: 2.5, p: 1.5, boxShadow: '0 8px 24px rgba(8,145,178,0.12)', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                  <EmojiEvents sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>Top Rated</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>LMS Platform 2025</Typography>
                  </Box>
                </Box>

                {/* Floating badge 2 */}
                <Box sx={{ position: 'absolute', bottom: -16, left: -16, background: '#fff', border: '1px solid rgba(8,145,178,0.15)', borderRadius: 2.5, p: 1.5, boxShadow: '0 8px 24px rgba(8,145,178,0.12)', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ color: '#0891b2', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>98% Satisfaction</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Student rating</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <Box sx={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {[
              { value: '500+', label: 'Institutions', icon: <AccountBalance sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
              { value: '48K+', label: 'Active Students', icon: <People sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
              { value: '12K+', label: 'Courses Offered', icon: <MenuBook sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
              { value: '99.9%', label: 'Uptime Guarantee', icon: <Speed sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }} /> },
            ].map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{s.icon}</Box>
                  <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>{s.value}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5, fontWeight: 500 }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="⚡ Platform Features" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Everything you need in one place
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 520, mx: 'auto', lineHeight: 1.8 }}>
              From multi-university hierarchy to real-time analytics — SDLMS has every tool your institution needs.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              { icon: <AutoGraph sx={{ color: '#0891b2', fontSize: 24 }} />, title: 'Real-Time Analytics', desc: 'Gain instant insights into enrollment trends, course completion rates, and learner performance across every level.', gradient: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(8,145,178,0.05))' },
              { icon: <Groups sx={{ color: '#0d9488', fontSize: 24 }} />, title: 'Multi-Role Management', desc: 'Distinct dashboards for LMS Admins, University Admins, Instructors, and Students — each tailored to their needs.', gradient: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.05))' },
              { icon: <Security sx={{ color: '#06b6d4', fontSize: 24 }} />, title: 'Enterprise Security', desc: 'Role-based access control, JWT authentication, and encrypted data storage keep your platform safe.', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))' },
              { icon: <Devices sx={{ color: '#14b8a6', fontSize: 24 }} />, title: 'Fully Responsive', desc: 'Optimized for desktop, tablet, and mobile. Students can learn from any device, anywhere, at any time.', gradient: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.05))' },
              { icon: <MenuBook sx={{ color: '#0891b2', fontSize: 24 }} />, title: 'Rich Course Catalog', desc: 'Create, organize, and publish courses with rich media, assessments, and self-paced or instructor-led modes.', gradient: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(8,145,178,0.05))' },
              { icon: <TrendingUp sx={{ color: '#0d9488', fontSize: 24 }} />, title: 'Progress Tracking', desc: 'Students and instructors can track completion milestones, quiz scores, and certification achievements in real time.', gradient: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.05))' },
            ].map((f) => (
              <Grid item xs={12} sm={6} lg={4} key={f.title}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Roles Section ──────────────────────────────────────────────── */}
      <Box id="roles" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="👥 Built for Everyone" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              A platform for every role
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}>
              Whether you govern a network of universities or just want to take a course — SDLMS has a home for you.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <RoleCard
                icon={<AdminPanelSettings sx={{ color: '#7c3aed', fontSize: 22 }} />}
                role="LMS Admin"
                color="#7c3aed"
                desc="System-wide control over universities, institutes, and users."
                perks={['Manage all universities', 'System-wide analytics', 'User & role management', 'Platform configuration']}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <RoleCard
                icon={<School sx={{ color: '#0891b2', fontSize: 22 }} />}
                role="University Admin"
                color="#0891b2"
                desc="Oversee institutes, faculty, and academic programs within your university."
                perks={['Manage institutes', 'Course oversight', 'Instructor assignment', 'University analytics']}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <RoleCard
                icon={<People sx={{ color: '#0d9488', fontSize: 22 }} />}
                role="Instructor"
                color="#0d9488"
                desc="Design and deliver engaging courses to enrolled students."
                perks={['Create & publish courses', 'Manage enrollments', 'Grade assignments', 'Track student progress']}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <RoleCard
                icon={<EmojiEvents sx={{ color: '#f59e0b', fontSize: 22 }} />}
                role="Student"
                color="#f59e0b"
                desc="Learn at your own pace and track your achievements."
                perks={['Browse course catalog', 'Enroll in courses', 'Track progress', 'Earn certifications']}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <Box id="testimonials" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="💬 What People Say" size="small" sx={{ mb: 2, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600, border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10 }} />
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Loved by educators & learners
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TestimonialCard
                name="Dr. Amara Nwosu"
                role="University Admin"
                university="Tech Univ."
                text="SDLMS transformed how we manage our 12 faculties. The role-based dashboards are intuitive and the analytics are superb."
                avatar="A"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TestimonialCard
                name="James Kalinda"
                role="Instructor"
                university="STEM Institute"
                text="Creating and publishing courses takes minutes. My students love the clean interface and the progress tracking keeps them motivated."
                avatar="J"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TestimonialCard
                name="Priya Sharma"
                role="Student"
                university="Global College"
                text="I can study from my phone, laptop, or tablet seamlessly. The dashboard shows exactly where I am and what I need to complete."
                avatar="P"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -40, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2, fontSize: { xs: '1.8rem', md: '2.6rem' } }}>
            Ready to transform your institution?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)', mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}>
            Join hundreds of universities already using SDLMS to deliver world-class education — free to start.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/auth/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2.5, fontWeight: 700, px: 4, py: 1.6, fontSize: '1rem',
                background: '#ffffff', color: '#0891b2',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                '&:hover': { background: '#f0f9ff', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' },
              }}
            >
              Create Free Account
            </Button>
            <Button
              component={Link}
              href="/auth/login"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2.5, fontWeight: 600, px: 3.5, py: 1.6,
                borderColor: 'rgba(255,255,255,0.5)', color: '#fff',
                '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)' },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <Box
        component="footer"
        sx={{ background: '#0f172a', py: 5, px: { xs: 3, md: 4 } }}
      >
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
              <Button
                component={Link}
                href="/auth/register"
                variant="contained"
                size="small"
                sx={{ borderRadius: 2, fontWeight: 600, background: 'linear-gradient(135deg, #0891b2, #0d9488)', '&:hover': { background: 'linear-gradient(135deg, #0e7490, #0f766e)' } }}
              >
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
