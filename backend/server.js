const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { initializeFirebase } = require('./src/config/firebase');

// Eagerly initialize Firebase Admin SDK with real credentials
initializeFirebase();
const authRoutes = require('./src/routes/auth.routes');
const universityRoutes = require('./src/routes/university.routes');
const instituteRoutes = require('./src/routes/institute.routes');
const userRoutes = require('./src/routes/user.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const programRoutes = require('./src/routes/program.routes');
const batchRoutes = require('./src/routes/batch.routes');
const semesterRoutes = require('./src/routes/semester.routes');
const surveyRoutes = require('./src/routes/survey.routes');
const courseRoutes = require('./src/routes/course.routes');
const unitRoutes = require('./src/routes/unit.routes');

const app = express();

// View engine (EJS for admin SSR pages)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route info
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Smart Digital Learning Management System (SDLMS) Backend API',
    status: 'Running',
    healthCheck: '/api/health',
    adminPanel: '/admin'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', unitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'SDLMS Backend'
  });
});

// EJS Admin Route (SSR)
app.get('/admin', (req, res) => {
  res.render('admin/index', { title: 'SDLMS Admin Panel' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not running on Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 SDLMS Backend running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`🖥️  Admin: http://localhost:${PORT}/admin\n`);
  });
}

module.exports = app;
