'use client';
import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Switch,
  Paper, Tooltip, IconButton, Chip, useTheme
} from '@mui/material';
import { Info, Security, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useGetRolePermissionsQuery, useToggleRolePermissionMutation } from '@/store/slices/lmsSlice';

// The roles requested by the user
const ROLES = [
  { id: 'SUPER_ADMIN', name: 'Super Admin', desc: 'System owner' },
  { id: 'UNIVERSITY_ADMIN', name: 'University Admin', desc: 'University-wide access' },
  { id: 'INSTITUTE_ADMIN', name: 'Institute Admin', desc: 'Institute-wide access' },
  { id: 'TECH_COORD', name: 'Technical Coordinator', desc: 'Program access' },
  { id: 'COURSE_COORD', name: 'Course Coordinator', desc: 'Course edit access' },
  { id: 'LEARNER', name: 'Learner', desc: 'Course view access' },
];

// The permissions representing the access scopes
const PERMISSIONS = [
  { id: 'all_access', name: 'All Access', tooltip: 'Full system control including creating universities and admins' },
  { id: 'uni_access', name: 'University-wide', tooltip: 'Manage all institutes and programs within a university' },
  { id: 'inst_access', name: 'Institute-wide', tooltip: 'Manage all programs, batches, and users within an institute' },
  { id: 'prog_access', name: 'Program Access', tooltip: 'Manage semesters, assign courses, and handle schedules' },
  { id: 'course_edit', name: 'Course Edit', tooltip: 'Create assignments, quizzes, and grade submissions' },
  { id: 'course_view', name: 'Course View', tooltip: 'View course materials and submit assignments' },
];

// Initial default configuration mapping roles to their default permissions
const INITIAL_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['all_access', 'uni_access', 'inst_access', 'prog_access', 'course_edit', 'course_view'],
  UNIVERSITY_ADMIN: ['uni_access', 'inst_access', 'prog_access', 'course_edit', 'course_view'],
  INSTITUTE_ADMIN: ['inst_access', 'prog_access', 'course_edit', 'course_view'],
  TECH_COORD: ['prog_access', 'course_edit', 'course_view'],
  COURSE_COORD: ['course_edit', 'course_view'],
  LEARNER: ['course_view'],
};

export default function RbacTable() {
  const theme = useTheme();

  // RTK Query Hooks for database access control configuration
  const { data: permissionsRes, isLoading } = useGetRolePermissionsQuery();
  const [togglePermission] = useToggleRolePermissionMutation();

  const rolePermissions = permissionsRes?.data || INITIAL_PERMISSIONS;

  const handleToggle = async (roleId: string, permId: string) => {
    try {
      const res = await togglePermission({ role: roleId, permission: permId }).unwrap();
      toast.success(res.message, {
        icon: res.enabled ? '🔓' : '🔒',
      });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update permission');
    }
  };

  return (
    <Card sx={{ 
      border: '1px solid rgba(8, 145, 178, 0.15)',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.05) 0%, rgba(6, 182, 212, 0.08) 100%)',
        borderBottom: '1px solid rgba(8, 145, 178, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(8, 145, 178, 0.1)', display: 'flex' }}>
            <Security sx={{ color: '#0891b2' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Role-Based Access Control
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Configure granular access permissions for each role in the system.
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ background: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, width: '25%', py: 3 }}>Role</TableCell>
              {PERMISSIONS.map(perm => (
                <TableCell key={perm.id} align="center" sx={{ fontWeight: 600, py: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {perm.name}
                    <Tooltip title={perm.tooltip} arrow placement="top">
                      <IconButton size="small" sx={{ color: 'text.disabled', p: 0.5 }}>
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ROLES.map((role, index) => (
              <TableRow 
                key={role.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: 'rgba(8, 145, 178, 0.02)' },
                  borderBottom: index === ROLES.length - 1 ? 'none' : '1px solid #e2e8f0'
                }}
              >
                <TableCell component="th" scope="row" sx={{ py: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {role.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {role.desc}
                  </Typography>
                </TableCell>
                
                {PERMISSIONS.map(perm => {
                  const isChecked = (rolePermissions[role.id] || []).includes(perm.id);
                  
                  // Disable toggle for Super Admin to ensure they don't lock themselves out, 
                  // or disable if you want visual only. We'll make them active for demonstration.
                  const isSuperAdminAllAccess = role.id === 'SUPER_ADMIN' && perm.id === 'all_access';

                  return (
                    <TableCell key={perm.id} align="center" sx={{ py: 2.5 }}>
                      <Switch
                        checked={isChecked}
                        onChange={() => handleToggle(role.id, perm.id)}
                        disabled={isSuperAdminAllAccess}
                        color={
                          perm.id === 'all_access' ? 'error' : 
                          perm.id === 'uni_access' ? 'secondary' : 
                          perm.id === 'inst_access' ? 'warning' :
                          perm.id === 'prog_access' ? 'info' :
                          'primary'
                        }
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            transform: 'translateX(20px)',
                          },
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
