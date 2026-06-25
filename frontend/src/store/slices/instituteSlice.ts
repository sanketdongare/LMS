import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase';

export interface Institute {
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
  universityId: string;
  university?: { id: string; name: string; code: string; logo?: string };
  adminId?: string;
  admin?: { id: string; name: string; email: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

export const instituteApi = createApi({
  reducerPath: 'instituteApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/institutes`,
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
  tagTypes: ['Institute'],
  endpoints: (builder) => ({
    getInstitutes: builder.query<
      { data: Institute[]; pagination: { page: number; limit: number; total: number; totalPages: number } },
      { page?: number; limit?: number; search?: string; universityId?: string; status?: string }
    >({
      query: ({ page = 1, limit = 10, search = '', universityId, status } = {}) => ({
        url: `?page=${page}&limit=${limit}&search=${search}${universityId ? `&universityId=${universityId}` : ''}${status !== undefined ? `&status=${status}` : ''}`,
      }),
      providesTags: ['Institute'],
    }),
    getInstitute: builder.query<{ data: Institute }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Institute', id }],
    }),
    createInstitute: builder.mutation<{ data: Institute; message: string }, Partial<Institute> & { universityId?: string }>({
      query: (body) => ({ url: '', method: 'POST', body }),
      invalidatesTags: ['Institute'],
    }),
    updateInstitute: builder.mutation<{ data: Institute }, { id: string; data: Partial<Institute> }>({
      query: ({ id, data }) => ({ url: `/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Institute'],
    }),
    deleteInstitute: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Institute'],
    }),
    deleteInstitutePermanent: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}?permanent=true`, method: 'DELETE' }),
      invalidatesTags: ['Institute'],
    }),
  }),
});

export const {
  useGetInstitutesQuery,
  useGetInstituteQuery,
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useDeleteInstituteMutation,
  useDeleteInstitutePermanentMutation,
} = instituteApi;
