const { getFirebaseAdmin } = require('../config/firebase');
const prisma = require('../config/prisma');

/**
 * Verify Firebase ID token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase Admin
    let decodedToken;
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock-token-')) {
      const uid = token.replace('mock-token-', '');
      const email = uid === 'demo-super-admin-uid' ? 'admin@sdlms.com' : `${uid.replace('mock-uid-', '')}@example.com`;
      decodedToken = {
        uid,
        email,
        name: email.split('@')[0],
      };
    } else {
      try {
        const admin = getFirebaseAdmin();
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (firebaseError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
    }

    // Find user in DB
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please complete registration.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
