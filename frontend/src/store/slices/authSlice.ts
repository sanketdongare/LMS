import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from '@/lib/firebase';

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'INSTITUTE_ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

// Sync user to DB after Firebase auth
export const syncUserToDB = createAsyncThunk(
  'auth/syncUser',
  async (firebaseUser: { uid: string; email: string; displayName: string | null; photoURL: string | null }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/sync', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        avatar: firebaseUser.photoURL,
      });
      return response.data.data as User;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync user');
    }
  }
);

// Login with email/password
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = await dispatch(syncUserToDB({ uid: result.user.uid, email: result.user.email!, displayName: result.user.displayName, photoURL: result.user.photoURL })).unwrap();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Register with email/password
export const registerWithEmail = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }: { email: string; password: string; name: string }, { dispatch, rejectWithValue }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const user = await dispatch(syncUserToDB({ uid: result.user.uid, email: result.user.email!, displayName: name, photoURL: result.user.photoURL })).unwrap();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login with Google
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = await dispatch(syncUserToDB({ uid: result.user.uid, email: result.user.email!, displayName: result.user.displayName, photoURL: result.user.photoURL })).unwrap();
      return user;
    } catch (error: any) {
      console.error('Firebase Google login error:', error);
      let msg = typeof error === 'string' ? error : (error?.message || 'Google login failed');
      
      if (error?.code === 'auth/popup-blocked') {
        msg = 'Popup blocked by browser. Please allow popups for this site.';
      } else if (error?.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.';
      } else if (error?.code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-In is not enabled in your Firebase Console (Authentication -> Sign-in method).';
      }
      return rejectWithValue(msg);
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.initialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginWithEmail.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithEmail.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginWithEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Register
      .addCase(registerWithEmail.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerWithEmail.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerWithEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Google
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginWithGoogle.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Logout
      .addCase(logout.fulfilled, (state) => { state.user = null; })
      // Sync
      .addCase(syncUserToDB.fulfilled, (state, action) => { state.user = action.payload; state.initialized = true; })
  },
});

export const { setUser, setInitialized, clearError } = authSlice.actions;
export default authSlice.reducer;
