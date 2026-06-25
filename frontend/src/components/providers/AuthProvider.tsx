'use client';
import { useEffect } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { useAppDispatch } from '@/store/store';
import { syncUserToDB, setUser, setInitialized } from '@/store/slices/authSlice';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await dispatch(syncUserToDB({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          })).unwrap();
          
          // Connect socket with user ID
          connectSocket(user.id);
        } catch (error) {
          console.error('Failed to sync user:', error);
          dispatch(setInitialized(true));
        }
      } else {
        dispatch(setUser(null));
        disconnectSocket();
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
