const admin = require('firebase-admin');

let firebaseApp;

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      console.log('⚠️  Running without Firebase verification (dev mode)');
    }
  }
  return admin;
};

const getFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    return initializeFirebase();
  }
  return admin;
};

module.exports = { initializeFirebase, getFirebaseAdmin };
