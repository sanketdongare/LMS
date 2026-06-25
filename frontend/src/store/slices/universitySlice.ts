import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase';

export interface University {
  id: string;
  name: string;
  code: string;
  logo?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
  isActive: boolean;
  adminId?: string;
  admin?: { id: string; name: string; email: string; avatar?: string };
  _count?: { courses: number };
  createdAt: string;
  updatedAt: string;
}

export interface UniversityStats {
  total: number;
  active: number;
  inactive: number;
  totalCourses: number;
  recentlyAdded: University[];
}

interface UniversityState {
  selectedUniversity: University | null;
  realtimeUpdates: University[];
}

const initialState: UniversityState = {
  selectedUniversity: null,
  realtimeUpdates: [],
};

// RTK Query API
export const universityApi = createApi({
  reducerPath: 'universityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/universities`,
    prepareHeaders: async (headers) => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (e) {}
      return headers;
    },
  }),
  tagTypes: ['University', 'UniversityStats'],
  endpoints: (builder) => ({
    getUniversities: builder.query<
      { data: University[]; pagination: { page: number; limit: number; total: number; totalPages: number } },
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 10, search = '', status } = {}) => ({
        url: `?page=${page}&limit=${limit}&search=${search}${status !== undefined ? `&status=${status}` : ''}`,
      }),
      providesTags: ['University'],
    }),
    getUniversity: builder.query<{ data: University }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'University', id }],
    }),
    getUniversityStats: builder.query<{ data: UniversityStats }, void>({
      query: () => '/stats',
      providesTags: ['UniversityStats'],
    }),
    createUniversity: builder.mutation<{ data: University; message: string }, Partial<University>>({
      query: (body) => ({ url: '', method: 'POST', body }),
      invalidatesTags: ['University', 'UniversityStats'],
    }),
    updateUniversity: builder.mutation<{ data: University }, { id: string; data: Partial<University> }>({
      query: ({ id, data }) => ({ url: `/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['University', 'UniversityStats'],
    }),
    deleteUniversity: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['University', 'UniversityStats'],
    }),
    deleteUniversityPermanent: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}?permanent=true`, method: 'DELETE' }),
      invalidatesTags: ['University', 'UniversityStats'],
    }),
  }),
});

export const {
  useGetUniversitiesQuery,
  useGetUniversityQuery,
  useGetUniversityStatsQuery,
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
  useDeleteUniversityMutation,
  useDeleteUniversityPermanentMutation,
} = universityApi;

// University slice for local state
const universitySlice = createSlice({
  name: 'university',
  initialState,
  reducers: {
    setSelectedUniversity: (state, action: PayloadAction<University | null>) => {
      state.selectedUniversity = action.payload;
    },
    addRealtimeUpdate: (state, action: PayloadAction<University>) => {
      state.realtimeUpdates.unshift(action.payload);
      if (state.realtimeUpdates.length > 20) state.realtimeUpdates.pop();
    },
  },
});

export const { setSelectedUniversity, addRealtimeUpdate } = universitySlice.actions;
export default universitySlice.reducer;
