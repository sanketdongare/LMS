'use client';
import { Box, Grid, Card, CardContent, Typography, Skeleton, Avatar, Chip } from '@mui/material';
import {
  School, People, MenuBook, TrendingUp, Add, AccountBalance,
  AdminPanelSettings, Class, AssignmentTurnedIn, BookmarkBorder,
} from '@mui/icons-material';
import { useGetUniversityStatsQuery } from '@/store/slices/universitySlice';
import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({
  title, value, subtitle, icon, gradient, loading,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; gradient: string; loading?: boolean;
}) => (
  <Card className="card-hover" sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      {loading ? (
        <>
          <Skeleton variant="rounded" width={48} height={48} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" />
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: gradient, display: 'flex' }}>
              {icon}
            </Box>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{title}</Typography>
          {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
        </>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const { data: statsData, isLoading } = useGetUniversityStatsQuery();
  const stats = statsData?.data;

  // Render separate views based on stats.role or user.role
  const activeRole = stats?.role || user?.role || 'STUDENT';

  // --- 1. LMS ADMIN VIEW ---
  if (activeRole === 'SUPER_ADMIN') {
    return (
      <Box className="page-content">
        {/* Welcome header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back,{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            System overview for Smart Digital LMS Administrator.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Universities"
              value={stats?.total ?? '—'}
              subtitle={`${stats?.active ?? 0} active`}
              icon={<School sx={{ color: '#6366f1', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Institutes"
              value={stats?.totalInstitutes ?? '—'}
              subtitle="Registered institutes"
              icon={<AccountBalance sx={{ color: '#a855f7', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(168,85,247,0.25), rgba(168,85,247,0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Courses"
              value={stats?.totalCourses ?? '—'}
              subtitle="Across all universities"
              icon={<MenuBook sx={{ color: '#10b981', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? '—'}
              subtitle="Active accounts"
              icon={<People sx={{ color: '#f59e0b', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Recently Added Universities */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Recently Added Universities</Typography>
                  <Link href="/dashboard/universities" style={{ textDecoration: 'none' }}>
                    <Chip label="View All" variant="outlined" size="small" color="primary" clickable />
                  </Link>
                </Box>

                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="30%" />
                      </Box>
                    </Box>
                  ))
                ) : stats?.recentlyAdded?.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <School sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography sx={{ color: 'text.secondary' }}>No universities yet</Typography>
                    <Link href="/dashboard/universities" style={{ textDecoration: 'none' }}>
                      <Chip label="Add University" icon={<Add />} color="primary" sx={{ mt: 2, cursor: 'pointer' }} clickable />
                    </Link>
                  </Box>
                ) : (
                  stats?.recentlyAdded?.map((uni: any) => (
                    <Box
                      key={uni.id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, mb: 1, transition: 'background 0.2s', '&:hover': { background: 'rgba(99,102,241,0.08)' } }}
                    >
                      <Avatar sx={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: 44, height: 44, fontSize: '1rem', fontWeight: 700 }}>
                        {uni.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{uni.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{uni.code}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {formatDistanceToNow(new Date(uni.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Link href="/dashboard/universities" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', background: 'rgba(99,102,241,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <School sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Universities</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Add, edit, or view universities</Typography>
                      </Box>
                    </Box>
                  </Link>
                  <Link href="/dashboard/institutes" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'secondary.main', background: 'rgba(168,85,247,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AccountBalance sx={{ color: 'secondary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Institutes</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Manage system institutes</Typography>
                      </Box>
                    </Box>
                  </Link>
                  <Link href="/dashboard/users" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'warning.main', background: 'rgba(245,158,11,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <People sx={{ color: 'warning.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Users</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Adjust user roles and profiles</Typography>
                      </Box>
                    </Box>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // --- 2b. INSTITUTE ADMIN VIEW ---
  if (activeRole === 'INSTITUTE_ADMIN') {
    return (
      <Box className="page-content">
        {/* Welcome header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back,{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Managing Campus: <strong style={{ color: '#0891b2' }}>{stats?.instituteName || 'Your Institute'} ({stats?.instituteCode || '—'})</strong> · {stats?.universityName}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Programs"
              value={stats?.totalPrograms ?? '—'}
              subtitle="Academic programs"
              icon={<Class sx={{ color: '#0891b2', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(8, 145, 178, 0.25), rgba(8, 145, 178, 0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Batches"
              value={stats?.totalBatches ?? '—'}
              subtitle="Active class groups"
              icon={<School sx={{ color: '#a855f7', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Enrolled Learners"
              value={stats?.totalLearners ?? '—'}
              subtitle="Enrolled students"
              icon={<People sx={{ color: '#10b981', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Surveys Created"
              value={stats?.totalSurveys ?? '—'}
              subtitle="Feedback surveys"
              icon={<AssignmentTurnedIn sx={{ color: '#f59e0b', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.05))"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Recently Added Programs / Batches */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Academic Programs</Typography>
                  <Link href="/dashboard/programs" style={{ textDecoration: 'none' }}>
                    <Chip label="Manage Programs" variant="outlined" size="small" color="primary" clickable />
                  </Link>
                </Box>

                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="30%" />
                      </Box>
                    </Box>
                  ))
                ) : stats?.recentlyAdded?.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Class sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography sx={{ color: 'text.secondary' }}>No programs created yet</Typography>
                    <Link href="/dashboard/programs" style={{ textDecoration: 'none' }}>
                      <Chip label="Add Program" icon={<Add />} color="primary" sx={{ mt: 2, cursor: 'pointer' }} clickable />
                    </Link>
                  </Box>
                ) : (
                  stats?.recentlyAdded?.map((prog: any) => (
                    <Box
                      key={prog.id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, mb: 1, transition: 'background 0.2s', '&:hover': { background: 'rgba(8, 145, 178, 0.08)' } }}
                    >
                      <Avatar sx={{ background: 'linear-gradient(135deg, #0891b2, #a855f7)', width: 44, height: 44, fontSize: '1rem', fontWeight: 700 }}>
                        {prog.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{prog.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{prog.code}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {formatDistanceToNow(new Date(prog.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Program Batches</Typography>
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="55%" />
                        <Skeleton variant="text" width="35%" />
                      </Box>
                    </Box>
                  ))
                ) : stats?.recentBatches?.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography sx={{ color: 'text.secondary' }}>No batches created in this program yet.</Typography>
                  </Box>
                ) : (
                  stats?.recentBatches?.map((batch: any) => (
                    <Box
                      key={batch.id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, mb: 1, transition: 'background 0.2s', '&:hover': { background: 'rgba(8, 145, 178, 0.08)' } }}
                    >
                      <Avatar sx={{ background: 'linear-gradient(135deg, #a855f7, #10b981)', width: 44, height: 44, fontSize: '1rem', fontWeight: 700 }}>
                        {batch.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{batch.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Program: {batch.program?.name} · {batch.code}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Link href="/dashboard/programs" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(8, 145, 178, 0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', background: 'rgba(8, 145, 178, 0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Class sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Programs & Batches</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Add academic plans & schedules</Typography>
                      </Box>
                    </Box>
                  </Link>
                  <Link href="/dashboard/courses" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(168, 85, 247, 0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'secondary.main', background: 'rgba(168, 85, 247, 0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MenuBook sx={{ color: 'secondary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Browse All Courses</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>View university course catalog</Typography>
                      </Box>
                    </Box>
                  </Link>
                  <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'success.main', background: 'rgba(16, 185, 129, 0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Settings sx={{ color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>System Settings</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Configure profile & preferences</Typography>
                      </Box>
                    </Box>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // --- 2. UNIVERSITY ADMIN VIEW ---
  if (activeRole === 'UNIVERSITY_ADMIN') {
    return (
      <Box className="page-content">
        {/* Welcome header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back,{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Manager'}</span> 👋
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Managing: <strong style={{ color: '#0891b2' }}>{stats?.universityName || 'Your University'} ({stats?.universityCode || '—'})</strong>
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Institutes"
              value={stats?.totalInstitutes ?? '—'}
              subtitle="Registered in university"
              icon={<AccountBalance sx={{ color: '#a855f7', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(168,85,247,0.25), rgba(168,85,247,0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Courses"
              value={stats?.totalCourses ?? '—'}
              subtitle="Offered by university"
              icon={<MenuBook sx={{ color: '#10b981', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Instructors"
              value={stats?.totalInstructors ?? '—'}
              subtitle="Teaching staff"
              icon={<AdminPanelSettings sx={{ color: '#38bdf8', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.05))"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Enrolled Students"
              value={stats?.totalStudents ?? '—'}
              subtitle="Active students"
              icon={<People sx={{ color: '#ec4899', fontSize: 24 }} />}
              gradient="linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.05))"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        {/* Recently Added Institutes */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Recently Added Institutes</Typography>
                  <Link href="/dashboard/institutes" style={{ textDecoration: 'none' }}>
                    <Chip label="View All" variant="outlined" size="small" color="primary" clickable />
                  </Link>
                </Box>

                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="30%" />
                      </Box>
                    </Box>
                  ))
                ) : stats?.recentlyAdded?.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography sx={{ color: 'text.secondary' }}>No institutes created yet</Typography>
                    <Link href="/dashboard/institutes" style={{ textDecoration: 'none' }}>
                      <Chip label="Create Institute" icon={<Add />} color="primary" sx={{ mt: 2, cursor: 'pointer' }} clickable />
                    </Link>
                  </Box>
                ) : (
                  stats?.recentlyAdded?.map((inst: any) => (
                    <Box
                      key={inst.id}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, mb: 1, transition: 'background 0.2s', '&:hover': { background: 'rgba(99,102,241,0.08)' } }}
                    >
                      <Avatar sx={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', width: 44, height: 44, fontSize: '1rem', fontWeight: 700 }}>
                        {inst.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{inst.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{inst.code}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {formatDistanceToNow(new Date(inst.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Link href="/dashboard/institutes" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', background: 'rgba(168,85,247,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AccountBalance sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Institutes</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Add or edit university institutes</Typography>
                      </Box>
                    </Box>
                  </Link>
                  <Link href="/dashboard/courses" style={{ textDecoration: 'none' }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'secondary.main', background: 'rgba(16,185,129,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MenuBook sx={{ color: 'secondary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Manage Courses</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track curriculum and syllabus</Typography>
                      </Box>
                    </Box>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // --- 3. INSTITUTE USER VIEW (INSTRUCTOR & STUDENT) ---
  return (
    <Box className="page-content">
      {/* Welcome header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Welcome back,{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {stats?.instituteName ? (
            <>
              Campus: <strong style={{ color: '#0891b2' }}>{stats.instituteName}</strong> ({stats.universityName})
            </>
          ) : (
            'Welcome to the Smart Digital Learning platform.'
          )}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Available Courses"
            value={stats?.totalCourses ?? '—'}
            subtitle="Explore active courses"
            icon={<Class sx={{ color: '#10b981', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Active Enrollments"
            value={stats?.activeEnrollments ?? '—'}
            subtitle="Courses in progress"
            icon={<BookmarkBorder sx={{ color: '#0ea5e9', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, rgba(14,165,233,0.25), rgba(14,165,233,0.05))"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Completed Courses"
            value={stats?.completedCourses ?? '—'}
            subtitle="Archived achievements"
            icon={<AssignmentTurnedIn sx={{ color: '#14b8a6', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, rgba(20,184,166,0.25), rgba(20,184,166,0.05))"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Recently Added Courses */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Courses in Campus</Typography>
                <Link href="/dashboard/courses" style={{ textDecoration: 'none' }}>
                  <Chip label="Browse Catalog" variant="outlined" size="small" color="primary" clickable />
                </Link>
              </Box>

              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="30%" />
                    </Box>
                  </Box>
                ))
              ) : stats?.recentCourses?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MenuBook sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography sx={{ color: 'text.secondary' }}>No courses published yet</Typography>
                </Box>
              ) : (
                stats?.recentCourses?.map((course: any) => (
                  <Box
                    key={course.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, mb: 1, transition: 'background 0.2s', '&:hover': { background: 'rgba(99,102,241,0.08)' } }}
                  >
                    <Avatar sx={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', width: 44, height: 44, fontSize: '1rem', fontWeight: 700 }}>
                      {course.title?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{course.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {course.duration ? `${course.duration} hours` : 'Self-paced'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Link href="/dashboard/courses" style={{ textDecoration: 'none' }}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', background: 'rgba(16,185,129,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Class sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Browse Courses</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Enroll in learning modules</Typography>
                    </Box>
                  </Box>
                </Link>
                <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'secondary.main', background: 'rgba(99,102,241,0.08)', transform: 'translateX(4px)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <People sx={{ color: 'secondary.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Account Profile</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Manage password and account details</Typography>
                    </Box>
                  </Box>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
