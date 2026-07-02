'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { useGetCoursesQuery } from '@/store/slices/courseSlice';

/* ─── Clay shadow helper ─── */
const clay = (color = '#bae6fd') =>
  `0 8px 32px 0 ${color}80, 0 1.5px 8px 0 #fff9, inset 0 2px 8px 0 #fff, inset 0 -3px 8px 0 ${color}55`;

/* ─── Bar chart data ─── */
const studyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 4.0 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 2.0 },
  { day: 'Sat', hours: 6.0 },
  { day: 'Sun', hours: 3.8 },
];
const MAX_HOURS = 7;

const barColors = [
  'from-violet-300 to-purple-400',
  'from-sky-300 to-blue-400',
  'from-emerald-300 to-teal-400',
  'from-amber-300 to-orange-400',
  'from-rose-300 to-pink-400',
  'from-indigo-300 to-violet-400',
  'from-cyan-300 to-sky-400',
];

/* ─── Leaderboard data ─── */
const leaders = [
  { rank: 1, name: 'Aryan Shah', score: 9820, avatar: 'A', badge: '🏆', color: 'from-amber-200 to-yellow-300' },
  { rank: 2, name: 'Priya Mehta', score: 8740, avatar: 'P', badge: '🥈', color: 'from-slate-200 to-slate-300' },
  { rank: 3, name: 'Ravi Kumar', score: 7910, avatar: 'R', badge: '🥉', color: 'from-orange-200 to-amber-300' },
  { rank: 4, name: 'Sara Ali', score: 7120, avatar: 'S', badge: '⭐', color: 'from-sky-200 to-blue-300' },
  { rank: 5, name: 'Dev Nair', score: 6580, avatar: 'D', badge: '⭐', color: 'from-violet-200 to-purple-300' },
];

/* ─── Course card colors ─── */
const courseColors = [
  { from: 'from-violet-300', to: 'to-indigo-400', light: 'bg-violet-50', icon: '📐' },
  { from: 'from-emerald-300', to: 'to-teal-400', light: 'bg-emerald-50', icon: '🧪' },
  { from: 'from-rose-300', to: 'to-pink-400', light: 'bg-rose-50', icon: '📊' },
  { from: 'from-amber-300', to: 'to-orange-400', light: 'bg-amber-50', icon: '🤖' },
  { from: 'from-sky-300', to: 'to-blue-400', light: 'bg-sky-50', icon: '🌐' },
  { from: 'from-fuchsia-300', to: 'to-purple-400', light: 'bg-fuchsia-50', icon: '🎨' },
];

/* ─── Float animation ─── */
const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' as const },
  },
};

/* ─── Circular Progress Ring ─── */
function ProgressRing({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) controls.start({ strokeDashoffset: offset, transition: { duration: 1.4, ease: 'easeOut' } });
  }, [inView, offset, controls]);

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ filter: 'drop-shadow(0 12px 32px #7c3aed44)' }}
      >
        <svg width={130} height={130} className="-rotate-90">
          <circle cx={65} cy={65} r={r} fill="none" stroke="#e8d5ff" strokeWidth={12} />
          <motion.circle
            cx={65}
            cy={65}
            r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={controls}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-violet-700">{pct}%</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Done</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Bar Chart ─── */
function StudyBar({ day, hours, color, idx }: { day: string; hours: number; color: string; idx: number }) {
  const [hovered, setHovered] = useState(false);
  const pct = (hours / MAX_HOURS) * 100;
  return (
    <div className="flex flex-col items-center gap-1 flex-1" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className="text-xs font-bold text-white bg-violet-600 rounded-xl px-2 py-0.5 shadow-lg mb-1 whitespace-nowrap"
          >
            {hours}h
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-24 w-full flex items-end rounded-2xl bg-white/60">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: idx * 0.08, duration: 0.7, ease: 'backOut' }}
          className={`w-full rounded-2xl bg-gradient-to-t ${color} cursor-pointer`}
          whileHover={{ scale: 1.06 }}
          style={{ boxShadow: clay('#a5b4fc') }}
        />
      </div>
      <span className="text-[11px] font-semibold text-slate-400">{day}</span>
    </div>
  );
}

/* ─── Clay Card wrapper ─── */
function ClayCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-3xl bg-white/80 backdrop-blur-sm border border-white/70 p-5 ${className}`}
      style={{ boxShadow: '0 8px 32px 0 #c7d2fe60, 0 1.5px 8px 0 #fff8, inset 0 2px 8px 0 #fff, inset 0 -3px 8px 0 #c7d2fe33', ...style }}
    >
      {children}
    </div>
  );
}

/* ─── Shimmer badge ─── */
function ShimmerBadge({ badge }: { badge: string }) {
  return (
    <motion.span
      animate={{ scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      className="text-xl"
    >
      {badge}
    </motion.span>
  );
}

/* ─── Floating Icon ─── */
function FloatIcon({ emoji, delay = 0, x = 0 }: { emoji: string; delay?: number; x?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0], x: [0, x, 0], rotate: [0, 4, -4, 0] }}
      transition={{ repeat: Infinity, duration: 4 + delay, ease: 'easeInOut', delay }}
      className="text-3xl select-none pointer-events-none"
    >
      {emoji}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function ClayDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const { data: coursesRes, isLoading } = useGetCoursesQuery();
  const courses = coursesRes?.data || [];
  const progress = 68;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-violet-50 p-4 md:p-8 font-sans">

      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <ClayCard className="relative overflow-hidden">
          {/* Floating decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Text */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-1">Your Learning Hub</p>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 leading-tight">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-teal-500 bg-clip-text text-transparent">
                    {user?.name?.split(' ')[0] || 'Explorer'}
                  </span>{' '}
                  🌟
                </h1>
                <p className="text-slate-500 text-sm mb-5 max-w-md">
                  You're making great progress! Keep the momentum going — your next milestone is just around the corner.
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Courses Enrolled', value: courses.length || '—', color: 'bg-violet-100 text-violet-700' },
                    { label: 'Completed', value: Math.floor((courses.length || 3) * 0.4), color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Streak', value: '🔥 7 days', color: 'bg-amber-100 text-amber-700' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold ${stat.color} cursor-pointer`}
                      style={{ boxShadow: '0 4px 16px 0 #0001, inset 0 1px 4px 0 #fff8' }}
                    >
                      <span className="block text-lg font-black">{stat.value}</span>
                      <span className="text-xs font-semibold opacity-70">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Progress Ring + Floating icons */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -top-4 -left-4">
                <FloatIcon emoji="📚" delay={0} x={3} />
              </div>
              <div className="absolute -bottom-4 -right-2">
                <FloatIcon emoji="🎯" delay={1} x={-3} />
              </div>
              <div className="absolute top-0 right-0">
                <FloatIcon emoji="⚡" delay={0.5} x={2} />
              </div>
              <div
                className="rounded-3xl bg-gradient-to-br from-violet-100 to-sky-100 p-6"
                style={{ boxShadow: clay('#c4b5fd') }}
              >
                <ProgressRing pct={progress} />
                <p className="text-center text-xs font-bold text-slate-400 mt-2">Overall Progress</p>
              </div>
            </div>
          </div>
        </ClayCard>
      </motion.div>

      {/* ── Grid: Courses + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* ── Course Carousel ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <ClayCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">My Courses</h2>
                <p className="text-xs text-slate-400 font-medium">Continue where you left off</p>
              </div>
              <Link href="/dashboard/courses">
                <motion.button
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.95, boxShadow: '0 2px 8px #0001' }}
                  className="text-xs font-bold text-violet-600 bg-violet-100 px-4 py-2 rounded-2xl"
                  style={{ boxShadow: '0 4px 12px #a78bfa30, inset 0 1px 4px #fff8' }}
                >
                  View All →
                </motion.button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <FloatIcon emoji="📖" delay={0} />
                <p className="text-slate-400 text-sm font-semibold">No courses yet — browse and enroll!</p>
                <Link href="/dashboard/courses">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="bg-gradient-to-r from-violet-500 to-sky-500 text-white font-bold px-6 py-2.5 rounded-2xl text-sm"
                    style={{ boxShadow: '0 8px 24px #7c3aed33' }}
                  >
                    Browse Courses
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                {courses.slice(0, 6).map((course, idx) => {
                  const c = courseColors[idx % courseColors.length];
                  const prog = Math.floor(Math.random() * 80) + 10;
                  return (
                    <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300 }}
                        whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 300 } }}
                        whileTap={{ scale: 0.97 }}
                        className={`rounded-2xl p-4 ${c.light} cursor-pointer relative overflow-hidden`}
                        style={{ boxShadow: '0 4px 20px #0001, inset 0 1px 6px #fff9' }}
                      >
                        <div className="absolute -top-4 -right-4 text-5xl opacity-20">{c.icon}</div>
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center text-white text-lg mb-2`}
                          style={{ boxShadow: '0 4px 12px #0002' }}>
                          {c.icon}
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                            <span>Progress</span><span>{prog}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/70 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${prog}%` }}
                              transition={{ delay: 0.3 + idx * 0.05, duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full bg-gradient-to-r ${c.from} ${c.to}`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ClayCard>
        </motion.div>

        {/* ── Leaderboard ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <ClayCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏆</span>
              <div>
                <h2 className="text-lg font-black text-slate-800">Leaderboard</h2>
                <p className="text-xs text-slate-400 font-medium">Top learners this week</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {leaders.map((l, idx) => (
                <motion.div
                  key={l.rank}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 260 }}
                  whileHover={{ x: 4, transition: { type: 'spring', stiffness: 300 } }}
                  className={`flex items-center gap-3 rounded-2xl p-3 bg-gradient-to-r ${l.color} cursor-pointer`}
                  style={{ boxShadow: '0 2px 12px #0001, inset 0 1px 4px #fff9' }}
                >
                  <div
                    className="w-9 h-9 rounded-2xl bg-white/80 flex items-center justify-center font-black text-slate-700 text-sm flex-shrink-0"
                    style={{ boxShadow: '0 2px 8px #0001' }}
                  >
                    {l.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 text-sm truncate">{l.name}</p>
                    <p className="text-xs text-slate-500 font-semibold">{l.score.toLocaleString()} pts</p>
                  </div>
                  <ShimmerBadge badge={l.badge} />
                </motion.div>
              ))}
            </div>
          </ClayCard>
        </motion.div>
      </div>

      {/* ── Analytics Bar Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="mb-6"
      >
        <ClayCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-800">Weekly Study Hours</h2>
              <p className="text-xs text-slate-400 font-medium">Hover each bar for details</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-2" style={{ boxShadow: '0 2px 12px #0001' }}>
              <span className="text-xl">📈</span>
              <div>
                <span className="block text-lg font-black text-emerald-700">
                  {studyData.reduce((a, d) => a + d.hours, 0).toFixed(1)}h
                </span>
                <span className="text-xs text-emerald-500 font-semibold">this week</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2 md:gap-3">
            {studyData.map((d, i) => (
              <StudyBar key={d.day} day={d.day} hours={d.hours} color={barColors[i]} idx={i} />
            ))}
          </div>
        </ClayCard>
      </motion.div>

      {/* ── Quick Actions Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
      >
        <h2 className="text-lg font-black text-slate-700 mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/dashboard/courses', emoji: '📚', label: 'Browse Courses', color: 'from-violet-100 to-indigo-100', text: 'text-violet-700', shadow: '#7c3aed' },
            { href: '/dashboard/programs', emoji: '🎓', label: 'Programs', color: 'from-sky-100 to-blue-100', text: 'text-sky-700', shadow: '#0ea5e9' },
            { href: '/dashboard/quick-creator', emoji: '⚡', label: 'Quick Creator', color: 'from-amber-100 to-yellow-100', text: 'text-amber-700', shadow: '#f59e0b' },
            { href: '/dashboard/analytics', emoji: '📊', label: 'Analytics', color: 'from-emerald-100 to-teal-100', text: 'text-emerald-700', shadow: '#10b981' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.06, y: -5, transition: { type: 'spring', stiffness: 300 } }}
                whileTap={{ scale: 0.95, boxShadow: '0 2px 8px #0001' }}
                className={`rounded-3xl p-5 bg-gradient-to-br ${item.color} flex flex-col items-center gap-2 cursor-pointer text-center`}
                style={{ boxShadow: `0 8px 24px ${item.shadow}22, inset 0 2px 8px #fff` }}
              >
                <motion.span
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="text-3xl"
                >
                  {item.emoji}
                </motion.span>
                <span className={`font-black text-sm ${item.text}`}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
