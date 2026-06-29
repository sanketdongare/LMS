'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Chip, TextField, InputAdornment, Skeleton, Avatar, Divider, Button
} from '@mui/material';
import {
  MenuBook, Search, People, Assignment, BookOnline, Add
} from '@mui/icons-material';
import Link from 'next/link';
import { useGetCoursesQuery } from '@/store/slices/courseSlice';
import { useAppSelector } from '@/store/store';

export default function CoursesPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: coursesRes, isLoading } = useGetCoursesQuery();

  const courses = coursesRes?.data || [];
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role || '');

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const totalEnrollments = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalAssignments = courses.reduce((sum, c) => sum + (c._count?.assignments || 0), 0);

  return (
    <Box className="page-content" sx={{ p: { xs: 2, md: 3 } }}>
      {/* Stats Header */}
      <Box sx={{
        mb: 4, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.05) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(8, 145, 178, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
              Course Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all active and inactive courses across your institutes.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {[
            { label: 'Total Courses', value: totalCourses, icon: <MenuBook />, color: '#0891b2' },
            { label: 'Published', value: publishedCourses, icon: <BookOnline />, color: '#10b981' },
            { label: 'Total Learners', value: totalEnrollments, icon: <People />, color: '#f59e0b' },
            { label: 'Total Assignments', value: totalAssignments, icon: <Assignment />, color: '#8b5cf6' },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box sx={{
                p: 2.5, borderRadius: 3, bgcolor: 'background.paper',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: 2,
                transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(0,0,0,0.06)' }
              }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800}>{isLoading ? '...' : stat.value}</Typography>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">{stat.label}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search courses..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            sx: { borderRadius: 3, bgcolor: 'background.paper', width: { xs: '100%', sm: 300 } }
          }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <MenuBook sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No courses found</Typography>
          <Typography variant="body2" color="text.secondary">Try adjusting your search criteria</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{
                borderRadius: 3, border: '1px solid rgba(8, 145, 178, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px -10px rgba(8, 145, 178, 0.2)',
                  borderColor: 'rgba(8, 145, 178, 0.4)'
                }
              }}>
                <CardActionArea component={Link} href={`/dashboard/courses/${course.id}`} sx={{ p: 2.5, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MenuBook />
                    </Box>
                    <Chip
                      size="small"
                      label={course.isPublished ? 'Published' : 'Draft'}
                      color={course.isPublished ? 'success' : 'default'}
                      variant={course.isPublished ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </Box>
                  
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, lineHeight: 1.2, height: 44, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {course.description || 'No description provided.'}
                  </Typography>

                  <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.05)' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={course.instructor?.avatar} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {course.instructor?.name?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="caption" fontWeight={500} color="text.secondary">
                            {course.instructor?.name || 'Unassigned'}
                        </Typography>
                     </Box>
                     <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ bgcolor: 'rgba(0,0,0,0.04)', px: 1, py: 0.5, borderRadius: 1 }}>
                        {course.duration ? `${course.duration} Weeks` : 'Self-paced'}
                     </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" icon={<People sx={{ fontSize: 14 }} />} label={`${course._count?.enrollments || 0} Learners`} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 600, border: 'none' }} />
                    <Chip size="small" icon={<Assignment sx={{ fontSize: 14 }} />} label={`${course._count?.assignments || 0} Assignments`} sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', fontWeight: 600, border: 'none' }} />
                  </Box>

                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
