import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import universityReducer, { universityApi } from './slices/universitySlice';
import notificationReducer from './slices/notificationSlice';
import { instituteApi } from './slices/instituteSlice';
import { lmsApi } from './slices/lmsSlice';
import { courseApi } from './slices/courseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    university: universityReducer,
    notifications: notificationReducer,
    [universityApi.reducerPath]: universityApi.reducer,
    [instituteApi.reducerPath]: instituteApi.reducer,
    [lmsApi.reducerPath]: lmsApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginWithEmail/pending'],
      },
    }).concat(universityApi.middleware, instituteApi.middleware, lmsApi.middleware, courseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

