const express = require('express');
const router = express.Router();
const { syncUser, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/auth/sync - Sync firebase user to DB
router.post('/sync', syncUser);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, getMe);

module.exports = router;
