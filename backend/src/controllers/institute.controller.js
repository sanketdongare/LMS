const prisma = require('../config/prisma');

/**
 * GET /api/institutes
 * Get all institutes (filtered by university for UNIVERSITY_ADMIN)
 */
const getInstitutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', universityId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // University admins can only see institutes of their managed university
    let filteredUniversityId = universityId;
    if (req.user.role === 'UNIVERSITY_ADMIN') {
      const managedUniversity = await prisma.university.findFirst({
        where: { adminId: req.user.id },
        select: { id: true },
      });
      if (!managedUniversity) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 },
        });
      }
      filteredUniversityId = managedUniversity.id;
    }

    const where = {
      ...(filteredUniversityId && { universityId: filteredUniversityId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status !== undefined && { isActive: status === 'true' }),
    };

    const [institutes, total] = await Promise.all([
      prisma.institute.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          university: { select: { id: true, name: true, code: true, logo: true } },
          admin: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      prisma.institute.count({ where }),
    ]);

    res.json({
      success: true,
      data: institutes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get institutes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch institutes' });
  }
};

/**
 * GET /api/institutes/:id
 * Get single institute by ID
 */
const getInstitute = async (req, res) => {
  try {
    const institute = await prisma.institute.findUnique({
      where: { id: req.params.id },
      include: {
        university: { select: { id: true, name: true, code: true, logo: true } },
        admin: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    // UNIVERSITY_ADMIN can only view institutes of their university
    if (req.user.role === 'UNIVERSITY_ADMIN') {
      const managedUniversity = await prisma.university.findFirst({
        where: { adminId: req.user.id },
        select: { id: true },
      });
      if (!managedUniversity || institute.universityId !== managedUniversity.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, data: institute });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch institute' });
  }
};

/**
 * POST /api/institutes
 * Create a new institute (UNIVERSITY_ADMIN creates under their university; SUPER_ADMIN can specify any)
 */
const createInstitute = async (req, res) => {
  try {
    const { name, code, logo, address, website, email, phone, description, adminId, universityId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }

    // Determine the universityId
    let resolvedUniversityId = universityId;

    if (req.user.role === 'UNIVERSITY_ADMIN') {
      // University admin can only create institutes in their managed university
      const managedUniversity = await prisma.university.findFirst({
        where: { adminId: req.user.id },
        select: { id: true },
      });
      if (!managedUniversity) {
        return res.status(403).json({ success: false, message: 'You do not manage any university' });
      }
      resolvedUniversityId = managedUniversity.id;
    }

    if (!resolvedUniversityId && req.user.role === 'SUPER_ADMIN') {
      const firstUni = await prisma.university.findFirst();
      if (firstUni) resolvedUniversityId = firstUni.id;
    }

    if (!resolvedUniversityId) {
      return res.status(400).json({ success: false, message: 'universityId is required or no university exists' });
    }

    // Check the university exists
    const university = await prisma.university.findUnique({ where: { id: resolvedUniversityId } });
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    // Check code uniqueness
    const existing = await prisma.institute.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Institute code already exists' });
    }

    const institute = await prisma.institute.create({
      data: {
        name,
        code: code.toUpperCase(),
        logo,
        address,
        website,
        email,
        phone,
        description,
        universityId: resolvedUniversityId,
        adminId: adminId || null,
      },
      include: {
        university: { select: { id: true, name: true, code: true, logo: true } },
        admin: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: institute, message: 'Institute created successfully' });
  } catch (error) {
    console.error('Create institute error:', error);
    res.status(500).json({ success: false, message: 'Failed to create institute' });
  }
};

/**
 * PUT /api/institutes/:id
 * Update an institute
 */
const updateInstitute = async (req, res) => {
  try {
    const { name, logo, address, website, email, phone, description, adminId, isActive } = req.body;

    const existing = await prisma.institute.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    // UNIVERSITY_ADMIN can only update institutes of their university
    if (req.user.role === 'UNIVERSITY_ADMIN') {
      const managedUniversity = await prisma.university.findFirst({
        where: { adminId: req.user.id },
        select: { id: true },
      });
      if (!managedUniversity || existing.universityId !== managedUniversity.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const institute = await prisma.institute.update({
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
        university: { select: { id: true, name: true, code: true, logo: true } },
        admin: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: institute, message: 'Institute updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update institute' });
  }
};

/**
 * DELETE /api/institutes/:id
 * Deactivate or permanently delete an institute
 */
const deleteInstitute = async (req, res) => {
  try {
    const existing = await prisma.institute.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    // UNIVERSITY_ADMIN can only delete institutes of their university
    if (req.user.role === 'UNIVERSITY_ADMIN') {
      const managedUniversity = await prisma.university.findFirst({
        where: { adminId: req.user.id },
        select: { id: true },
      });
      if (!managedUniversity || existing.universityId !== managedUniversity.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const { permanent } = req.query;

    if (permanent === 'true') {
      await prisma.institute.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Institute permanently deleted' });
    }

    await prisma.institute.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Institute deactivated successfully' });
  } catch (error) {
    console.error('Delete institute error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete institute' });
  }
};

module.exports = { getInstitutes, getInstitute, createInstitute, updateInstitute, deleteInstitute };
