const prisma = require('../config/prisma');

/**
 * GET /api/programs
 * Get all programs of the logged-in admin's institute
 */
const getPrograms = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const role = req.user.role;
    let whereClause = {};

    if (role === 'SUPER_ADMIN') {
      whereClause = {};
    } else if (role === 'UNIVERSITY_ADMIN') {
      const university = await prisma.university.findFirst({
        where: { adminId: req.user.id },
      });
      if (university) {
        whereClause = { institute: { universityId: university.id } };
      } else {
        return res.json({ success: true, data: [] });
      }
    } else {
      // INSTITUTE_ADMIN or other
      const institute = await prisma.institute.findFirst({
        where: { adminId: req.user.id },
      });
      if (institute) {
        whereClause = { instituteId: institute.id };
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { batches: true } },
        institute: { select: { name: true } },
      },
    });

    res.json({ success: true, data: programs });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch programs' });
  }
};

/**
 * POST /api/programs
 * Create program
 */
const createProgram = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }

    let instituteId = req.body.instituteId;

    if (req.user.role === 'SUPER_ADMIN' && !instituteId) {
      const firstInst = await prisma.institute.findFirst();
      if (firstInst) instituteId = firstInst.id;
    } else if (!instituteId) {
      const institute = await prisma.institute.findFirst({
        where: req.user.role === 'UNIVERSITY_ADMIN' 
          ? { university: { adminId: req.user.id } } 
          : { adminId: req.user.id },
      });
      if (institute) instituteId = institute.id;
    }

    if (!instituteId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to any institute or no institute exists' });
    }

    // Check duplicate code
    const existing = await prisma.program.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Program code already exists' });
    }

    const program = await prisma.program.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        instituteId: instituteId,
      },
    });

    res.status(201).json({ success: true, data: program, message: 'Program created successfully' });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ success: false, message: 'Failed to create program' });
  }
};

/**
 * PUT /api/programs/:id
 * Update program
 */
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const role = req.user.role;

    const program = await prisma.program.findUnique({
      where: { id },
      include: { institute: true }
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Access control
    if (role !== 'SUPER_ADMIN') {
      if (role === 'UNIVERSITY_ADMIN') {
        const uni = await prisma.university.findFirst({ where: { adminId: req.user.id } });
        if (!uni || program.institute.universityId !== uni.id) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
      } else {
        if (program.institute.adminId !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
      }
    }

    const updated = await prisma.program.update({
      where: { id },
      data: {
        ...(name && { name }),
        description,
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: updated, message: 'Program updated successfully' });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ success: false, message: 'Failed to update program' });
  }
};

/**
 * DELETE /api/programs/:id
 * Delete program
 */
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    const program = await prisma.program.findUnique({
      where: { id },
      include: { institute: true }
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Access control
    if (role !== 'SUPER_ADMIN') {
      if (role === 'UNIVERSITY_ADMIN') {
        const uni = await prisma.university.findFirst({ where: { adminId: req.user.id } });
        if (!uni || program.institute.universityId !== uni.id) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
      } else {
        if (program.institute.adminId !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
      }
    }

    await prisma.program.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete program' });
  }
};

module.exports = {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
};
