const prisma = require('../config/prisma');

/**
 * GET /api/programs
 * Get all programs of the logged-in admin's institute
 */
const getPrograms = async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Find managed institute
    const institute = await prisma.institute.findFirst({
      where: { adminId: req.user.id },
    });

    if (!institute) {
      return res.json({ success: true, data: [] });
    }

    const programs = await prisma.program.findMany({
      where: {
        instituteId: institute.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { batches: true } },
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

    const institute = await prisma.institute.findFirst({
      where: { adminId: req.user.id },
    });

    if (!institute) {
      return res.status(403).json({ success: false, message: 'You are not assigned to any institute' });
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
        instituteId: institute.id,
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

    const institute = await prisma.institute.findFirst({
      where: { adminId: req.user.id },
    });

    if (!institute) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const program = await prisma.program.findFirst({
      where: { id, instituteId: institute.id },
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
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

    const institute = await prisma.institute.findFirst({
      where: { adminId: req.user.id },
    });

    if (!institute) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const program = await prisma.program.findFirst({
      where: { id, instituteId: institute.id },
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
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
