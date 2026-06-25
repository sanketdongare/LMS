import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase';

export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  instituteId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { batches: number };
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  programId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { enrollments: number; semesters: number };
}

export interface Semester {
  id: string;
  name: string;
  number: number;
  isActive: boolean;
  batchId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { courses: number };
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  isPublished: boolean;
  isActive: boolean;
  universityId: string;
  instructorId?: string;
  semesterId?: string;
  createdAt: string;
  updatedAt: string;
  instructor?: { name: string; email: string };
}

export interface Learner {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface BatchAnnouncement {
  id: string;
  title: string;
  content: string;
  batchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'RATING';
  options?: string;
  isRequired: boolean;
  surveyId: string;
}

export interface SurveyAnswer {
  id: string;
  answer: string;
  questionId: string;
  question?: { text: string; type: string };
}

export interface SurveyResponse {
  id: string;
  submittedAt: string;
  surveyId: string;
  userId: string;
  user: { id: string; name: string; email: string };
  answers: SurveyAnswer[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  batchId: string;
  createdAt: string;
  updatedAt: string;
  questions?: SurveyQuestion[];
  responses?: SurveyResponse[];
  _count?: { questions: number; responses: number };
}

export interface BatchAnalytics {
  enrollmentCount: number;
  semesterCount: number;
  courseCount: number;
  surveyStats: Array<{
    id: string;
    title: string;
    responses: number;
    questions: number;
    completionRate: number;
  }>;
}

export const lmsApi = createApi({
  reducerPath: 'lmsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}`,
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
  tagTypes: ['Program', 'Batch', 'Semester', 'Course', 'Learner', 'Announcement', 'Survey', 'Analytics', 'User'],
  endpoints: (builder) => ({
    // Programs
    getPrograms: builder.query<{ success: boolean; data: Program[] }, { search?: string } | void>({
      query: (params) => ({
        url: '/programs',
        params: params || {},
      }),
      providesTags: ['Program'],
    }),
    createProgram: builder.mutation<{ success: boolean; data: Program; message: string }, Partial<Program>>({
      query: (body) => ({ url: '/programs', method: 'POST', body }),
      invalidatesTags: ['Program'],
    }),
    updateProgram: builder.mutation<{ success: boolean; data: Program; message: string }, { id: string; body: Partial<Program> }>({
      query: ({ id, body }) => ({ url: `/programs/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Program'],
    }),
    deleteProgram: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/programs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Program'],
    }),

    // Batches
    getBatches: builder.query<{ success: boolean; data: Batch[] }, string>({
      query: (programId) => `/batches?programId=${programId}`,
      providesTags: ['Batch'],
    }),
    createBatch: builder.mutation<{ success: boolean; data: Batch; message: string }, Partial<Batch>>({
      query: (body) => ({ url: '/batches', method: 'POST', body }),
      invalidatesTags: ['Batch'],
    }),
    updateBatch: builder.mutation<{ success: boolean; data: Batch; message: string }, { id: string; body: Partial<Batch> }>({
      query: ({ id, body }) => ({ url: `/batches/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Batch'],
    }),
    deleteBatch: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/batches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Batch'],
    }),

    // Learners
    getLearners: builder.query<{ success: boolean; data: Array<{ id: string; enrolledAt: string; user: Learner }> }, string>({
      query: (batchId) => `/batches/${batchId}/learners`,
      providesTags: ['Learner'],
    }),
    getAvailableLearners: builder.query<{ success: boolean; data: Learner[] }, { batchId: string; search?: string }>({
      query: ({ batchId, search = '' }) => `/batches/${batchId}/learners?availableOnly=true&search=${search}`,
      providesTags: ['Learner'],
    }),
    enrollLearner: builder.mutation<{ success: boolean; message: string }, { batchId: string; userId: string }>({
      query: ({ batchId, userId }) => ({ url: `/batches/${batchId}/learners`, method: 'POST', body: { userId } }),
      invalidatesTags: ['Learner', 'Analytics'],
    }),
    unenrollLearner: builder.mutation<{ success: boolean; message: string }, { batchId: string; userId: string }>({
      query: ({ batchId, userId }) => ({ url: `/batches/${batchId}/learners/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Learner', 'Analytics'],
    }),

    // Announcements
    getAnnouncements: builder.query<{ success: boolean; data: BatchAnnouncement[] }, string>({
      query: (batchId) => `/batches/${batchId}/announcements`,
      providesTags: ['Announcement'],
    }),
    createAnnouncement: builder.mutation<{ success: boolean; data: BatchAnnouncement }, { batchId: string; title: string; content: string }>({
      query: ({ batchId, ...body }) => ({ url: `/batches/${batchId}/announcements`, method: 'POST', body }),
      invalidatesTags: ['Announcement'],
    }),

    // Semesters
    getSemesters: builder.query<{ success: boolean; data: Semester[] }, string>({
      query: (batchId) => `/semesters?batchId=${batchId}`,
      providesTags: ['Semester'],
    }),
    createSemester: builder.mutation<{ success: boolean; data: Semester; message: string }, Partial<Semester>>({
      query: (body) => ({ url: '/semesters', method: 'POST', body }),
      invalidatesTags: ['Semester'],
    }),
    deleteSemester: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/semesters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Semester'],
    }),

    // Semester Courses
    getSemesterCourses: builder.query<{ success: boolean; data: Course[] }, string>({
      query: (semesterId) => `/semesters/${semesterId}/courses`,
      providesTags: ['Course'],
    }),
    assignCourseToSemester: builder.mutation<{ success: boolean; data: Course; message: string }, { semesterId: string; courseId?: string; title?: string; description?: string; duration?: number }>({
      query: ({ semesterId, ...body }) => ({ url: `/semesters/${semesterId}/courses`, method: 'POST', body }),
      invalidatesTags: ['Course', 'Semester', 'Analytics'],
    }),
    unassignCourseFromSemester: builder.mutation<{ success: boolean; message: string }, { semesterId: string; courseId: string }>({
      query: ({ semesterId, courseId }) => ({ url: `/semesters/${semesterId}/courses/${courseId}`, method: 'DELETE' }),
      invalidatesTags: ['Course', 'Semester', 'Analytics'],
    }),

    // Surveys
    getSurveys: builder.query<{ success: boolean; data: Survey[] }, string>({
      query: (batchId) => `/surveys?batchId=${batchId}`,
      providesTags: ['Survey'],
    }),
    getSurvey: builder.query<{ success: boolean; data: Survey }, string>({
      query: (id) => `/surveys/${id}`,
      providesTags: (result, error, id) => [{ type: 'Survey', id }],
    }),
    createSurvey: builder.mutation<{ success: boolean; data: Survey; message: string }, Partial<Survey>>({
      query: (body) => ({ url: '/surveys', method: 'POST', body }),
      invalidatesTags: ['Survey'],
    }),
    deleteSurvey: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/surveys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Survey'],
    }),
    addQuestionToSurvey: builder.mutation<{ success: boolean; data: SurveyQuestion; message: string }, { surveyId: string; text: string; type: string; options?: string; isRequired?: boolean }>({
      query: ({ surveyId, ...body }) => ({ url: `/surveys/${surveyId}/questions`, method: 'POST', body }),
      invalidatesTags: (result, error, { surveyId }) => ['Survey', { type: 'Survey', id: surveyId }],
    }),
    deleteQuestion: builder.mutation<{ success: boolean; message: string }, { surveyId: string; questionId: string }>({
      query: ({ questionId }) => ({ url: `/surveys/questions/${questionId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { surveyId }) => ['Survey', { type: 'Survey', id: surveyId }],
    }),
    submitSurveyResponse: builder.mutation<{ success: boolean; message: string }, { surveyId: string; answers: Array<{ questionId: string; answer: string }> }>({
      query: ({ surveyId, answers }) => ({ url: `/surveys/${surveyId}/responses`, method: 'POST', body: { answers } }),
      invalidatesTags: (result, error, { surveyId }) => ['Survey', { type: 'Survey', id: surveyId }, 'Analytics'],
    }),

    // Batch Analytics
    getBatchAnalytics: builder.query<{ success: boolean; data: BatchAnalytics }, string>({
      query: (batchId) => `/batches/${batchId}/analytics`,
      providesTags: ['Analytics'],
    }),

    // Users (Admin panel)
    getUsers: builder.query<
      { success: boolean; data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } },
      { page?: number; limit?: number; search?: string; role?: string }
    >({
      query: ({ page = 1, limit = 10, search = '', role } = {}) => ({
        url: `/users?page=${page}&limit=${limit}&search=${search}${role ? `&role=${role}` : ''}`,
      }),
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation<{ success: boolean; data: any; message: string }, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useGetLearnersQuery,
  useGetAvailableLearnersQuery,
  useEnrollLearnerMutation,
  useUnenrollLearnerMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useGetSemestersQuery,
  useCreateSemesterMutation,
  useDeleteSemesterMutation,
  useGetSemesterCoursesQuery,
  useAssignCourseToSemesterMutation,
  useUnassignCourseFromSemesterMutation,
  useGetSurveysQuery,
  useGetSurveyQuery,
  useCreateSurveyMutation,
  useDeleteSurveyMutation,
  useAddQuestionToSurveyMutation,
  useDeleteQuestionMutation,
  useSubmitSurveyResponseMutation,
  useGetBatchAnalyticsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} = lmsApi;
