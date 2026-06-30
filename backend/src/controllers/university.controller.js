const prisma = require('../config/prisma');

/**
 * GET /api/universities
 * Get all universities with pagination & search
 */
const getUniversities = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status !== undefined && { isActive: status === 'true' }),
    };

    const [universities, total] = await Promise.all([
      prisma.university.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { courses: true } },
        },
      }),
      prisma.university.count({ where }),
    ]);

    res.json({
      success: true,
      data: universities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch universities' });
  }
};

/**
 * GET /api/universities/:id
 * Get single university by ID
 */
const getUniversity = async (req, res) => {
  try {
    const university = await prisma.university.findUnique({
      where: { id: req.params.id },
      include: {
        admin: { select: { id: true, name: true, email: true, avatar: true } },
        courses: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, title: true, isPublished: true, createdAt: true },
        },
        _count: { select: { courses: true } },
      },
    });

    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    res.json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch university' });
  }
};

/**
 * POST /api/universities
 * Create a new university
 */
const createUniversity = async (req, res) => {
  try {
    const { name, code, logo, address, website, email, phone, description, adminId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }

    // Check code uniqueness
    const existing = await prisma.university.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'University code already exists' });
    }

    const university = await prisma.university.create({
      data: {
        name,
        code: code.toUpperCase(),
        logo,
        address,
        website,
        email,
        phone,
        description,
        adminId: adminId || null,
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { courses: true } },
      },
    });

    // Create notification for all admins
    const admins = await prisma.user.findMany({ 
      where: { role: { in: ['SUPER_ADMIN'] } },
      select: { id: true }
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New University Added',
          message: `University "${name}" (${code.toUpperCase()}) has been created.`,
          type: 'SUCCESS',
          link: `/dashboard/universities/${university.id}`,
        })),
      });
    }

    res.status(201).json({ success: true, data: university, message: 'University created successfully' });
  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({ success: false, message: 'Failed to create university' });
  }
};

/**
 * PUT /api/universities/:id
 * Update a university
 */
const updateUniversity = async (req, res) => {
  try {
    const { name, logo, address, website, email, phone, description, adminId, isActive } = req.body;

    const existing = await prisma.university.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    const university = await prisma.university.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(logo !== undefined && { logo }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(description !== undefined && { description }),
        ...(adminId !== undefined && { adminId: adminId || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { courses: true } },
      },
    });

    res.json({ success: true, data: university, message: 'University updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update university' });
  }
};

/**
 * DELETE /api/universities/:id
 * Delete or deactivate a university
 */
const deleteUniversity = async (req, res) => {
  try {
    const existing = await prisma.university.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    const { permanent } = req.query;

    if (permanent === 'true') {
      await prisma.$transaction([
        prisma.enrollment.deleteMany({
          where: {
            course: {
              universityId: req.params.id
            }
          }
        }),
        prisma.course.deleteMany({
          where: {
            universityId: req.params.id
          }
        }),
        prisma.university.delete({
          where: {
            id: req.params.id
          }
        })
      ]);

      return res.json({ success: true, message: 'University permanently deleted successfully' });
    }

    await prisma.university.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'University deactivated successfully' });
  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete university' });
  }
};

/**
 * GET /api/universities/stats
 * Get university statistics
 */
const getStats = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === 'SUPER_ADMIN') {
      const [totalUniversities, activeUniversities, totalInstitutes, totalCourses, totalUsers, recentlyAdded, recentInstitutes] = await Promise.all([
        prisma.university.count(),
        prisma.university.count({ where: { isActive: true } }),
        prisma.institute.count(),
        prisma.course.count(),
        prisma.user.count(),
        prisma.university.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, code: true, logo: true, createdAt: true },
        }),
        prisma.institute.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { university: { select: { name: true } } },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          role: 'SUPER_ADMIN',
          total: totalUniversities,
          active: activeUniversities,
          inactive: totalUniversities - activeUniversities,
          totalInstitutes,
          totalCourses,
          totalUsers,
          recentlyAdded,
          recentInstitutes,
        },
      });
    }

    if (role === 'UNIVERSITY_ADMIN') {
      // Find the university managed by this admin
      const university = await prisma.university.findFirst({
        where: { adminId: userId },
        include: {
          institutes: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!university) {
        return res.json({
          success: true,
          data: {
            role: 'UNIVERSITY_ADMIN',
            universityName: null,
            totalInstitutes: 0,
            totalCourses: 0,
            totalInstructors: 0,
            totalStudents: 0,
            recentlyAdded: [],
            recentCourses: [],
          },
        });
      }

      const [totalInstitutes, totalCourses, totalInstructors, totalStudents, recentCourses] = await Promise.all([
        prisma.institute.count({ where: { universityId: university.id } }),
        prisma.course.count({ where: { universityId: university.id } }),
        prisma.user.count({ where: { role: 'INSTRUCTOR', taughtCourses: { some: { universityId: university.id } } } }),
        prisma.user.count({ where: { role: 'STUDENT', enrollments: { some: { course: { universityId: university.id } } } } }),
        prisma.course.findMany({
          where: { universityId: university.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, title: true, isPublished: true, createdAt: true },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          role: 'UNIVERSITY_ADMIN',
          universityId: university.id,
          universityName: university.name,
          universityCode: university.code,
          total: totalInstitutes, // mapping 'total' to totalInstitutes
          totalInstitutes,
          totalCourses,
          totalInstructors,
          totalStudents,
          recentlyAdded: university.institutes, // mapping to 'recentlyAdded'
          recentCourses,
        },
      });
    }

    if (role === 'INSTITUTE_ADMIN') {
      const institute = await prisma.institute.findFirst({
        where: { adminId: userId },
        include: { university: { select: { name: true } } },
      });

      if (!institute) {
        return res.json({
          success: true,
          data: {
            role: 'INSTITUTE_ADMIN',
            instituteName: null,
            totalPrograms: 0,
            totalBatches: 0,
            totalLearners: 0,
            totalSurveys: 0,
            recentlyAdded: [],
            recentBatches: [],
          },
        });
      }

      const programs = await prisma.program.findMany({
        where: { instituteId: institute.id },
        select: { id: true },
      });
      const programIds = programs.map((p) => p.id);

      const [totalPrograms, totalBatches, totalLearners, totalSurveys, recentlyAdded, recentBatches] = await Promise.all([
        prisma.program.count({ where: { instituteId: institute.id } }),
        prisma.batch.count({ where: { programId: { in: programIds } } }),
        prisma.batchEnrollment.count({ where: { batch: { programId: { in: programIds } } } }),
        prisma.survey.count({ where: { batch: { programId: { in: programIds } } } }),
        prisma.program.findMany({
          where: { instituteId: institute.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.batch.findMany({
          where: { programId: { in: programIds } },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { program: { select: { name: true } } },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          role: 'INSTITUTE_ADMIN',
          instituteId: institute.id,
          instituteName: institute.name,
          instituteCode: institute.code,
          universityName: institute.university?.name || 'Smart Digital University',
          totalPrograms,
          totalBatches,
          totalLearners,
          totalSurveys,
          recentlyAdded,
          recentBatches,
        },
      });
    }

    // Default: INSTRUCTOR or STUDENT (Institute level)
    // Find the institute the user is associated with.
    const managedInstitute = await prisma.institute.findFirst({
      where: { adminId: userId },
      include: { university: { select: { name: true } } },
    });

    let targetInstitute = managedInstitute;

    if (!targetInstitute) {
      if (role === 'INSTRUCTOR') {
        const firstTaught = await prisma.course.findFirst({
          where: { instructorId: userId },
          include: { university: true },
        });
        if (firstTaught) {
          targetInstitute = await prisma.institute.findFirst({
            where: { universityId: firstTaught.universityId },
            include: { university: { select: { name: true } } },
          });
        }
      } else {
        const firstEnrollment = await prisma.enrollment.findFirst({
          where: { userId },
          include: { course: true },
        });
        if (firstEnrollment) {
          targetInstitute = await prisma.institute.findFirst({
            where: { universityId: firstEnrollment.course.universityId },
            include: { university: { select: { name: true } } },
          });
        }
      }
    }

    // If still no institute, try to get any first institute in the system to present stats
    if (!targetInstitute) {
      targetInstitute = await prisma.institute.findFirst({
        include: { university: { select: { name: true } } },
      });
    }

    if (!targetInstitute) {
      return res.json({
        success: true,
        data: {
          role: role,
          instituteName: null,
          totalCourses: 0,
          activeEnrollments: 0,
          completedCourses: 0,
          recentCourses: [],
        },
      });
    }

    const [totalCourses, activeEnrollments, completedCourses, recentCourses] = await Promise.all([
      prisma.course.count({ where: { universityId: targetInstitute.universityId } }),
      prisma.enrollment.count({ where: { userId, status: 'ENROLLED' } }),
      prisma.enrollment.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.course.findMany({
        where: { universityId: targetInstitute.universityId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        role: role,
        instituteId: targetInstitute.id,
        instituteName: targetInstitute.name,
        instituteCode: targetInstitute.code,
        universityName: targetInstitute.university.name,
        total: totalCourses,
        totalCourses,
        activeEnrollments,
        completedCourses,
        recentCourses,
      },
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getUniversities, getUniversity, createUniversity, updateUniversity, deleteUniversity, getStats };
