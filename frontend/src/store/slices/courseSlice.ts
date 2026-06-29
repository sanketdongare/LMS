import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '@/lib/firebase';

/* ─── Types ─── */
export interface CourseListItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  instructor?: { name: string; avatar?: string };
  semester?: { name: string; batch: { name: string } };
  _count?: { enrollments: number; assignments: number };
}

export interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  isPublished: boolean;
  isActive: boolean;
  universityId: string;
  instructorId?: string;
  createdAt: string;
  instructor?: { name: string; email: string; avatar?: string };
  outcomes: CourseOutcome[];
  agent?: CourseAgent | null;
}

export interface CourseOutcome {
  id: string;
  description: string;
  courseId: string;
}

export interface CourseAnnouncement {
  id: string;
  title: string;
  content: string;
  courseId: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  points?: number;
  courseId: string;
  createdAt: string;
  rubric?: Rubric | null;
  _count?: { submissions: number };
}

export interface Rubric {
  id: string;
  criteriaJson: string;
  assignmentId: string;
}

export interface Submission {
  id: string;
  content?: string;
  fileUrl?: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
  assignmentId: string;
  userId: string;
  user?: { name: string; email: string };
}

export interface DiscussionTopic {
  id: string;
  title: string;
  content: string;
  courseId: string;
  createdAt: string;
  author: { name: string; avatar?: string };
  _count?: { posts: number };
}

export interface DiscussionPost {
  id: string;
  content: string;
  createdAt: string;
  topicId: string;
  author: { name: string; avatar?: string };
}

export interface CourseAgent {
  id: string;
  name: string;
  systemPrompt: string;
  isActive: boolean;
  courseId: string;
}

export interface CourseAnalytics {
  totalEnrollments: number;
  totalAssignments: number;
  totalSubmissions: number;
  averageEngagement: number;
  completionRate: number;
}

export interface CourseUnit {
  id: string;
  title: string;
  description?: string;
  order: number;
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  isPublished: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts: number;
  isPublished: boolean;
  unitId: string;
  createdAt: string;
  questions?: QuizQuestion[];
  _count?: { attempts: number };
}

export interface QuizQuestion {
  id: string;
  type: 'MCQ' | 'SAQ';
  questionText: string;
  optionsJson?: string | null;
  correctAnswer?: string | null;
  points: number;
  order: number;
  quizId: string;
}

export interface QuizAttempt {
  id: string;
  score?: number | null;
  maxScore?: number | null;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  startedAt: string;
  submittedAt?: string | null;
  quizId: string;
  userId: string;
  user?: { id: string; name: string; email: string; avatar?: string };
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  answerText: string;
  isCorrect?: boolean | null;
  pointsAwarded?: number | null;
  feedback?: string | null;
  questionId: string;
  attemptId: string;
  question?: { type: string; questionText: string; correctAnswer?: string | null; points: number };
}

/* ─── API ─── */
export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}`,
    prepareHeaders: async (headers) => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (e) { /* noop */ }
      return headers;
    },
  }),
  tagTypes: ['Courses', 'CourseDetail', 'Outcomes', 'Announcements', 'Assignments', 'Topics', 'Posts', 'Agent', 'Analytics', 'Units', 'Quizzes', 'Attempts'],
  endpoints: (builder) => ({

    // --- Courses List & Detail ---
    getCourses: builder.query<{ success: boolean; data: CourseListItem[] }, void>({
      query: () => '/courses',
      providesTags: ['Courses'],
    }),
    getCourseById: builder.query<{ success: boolean; data: CourseDetail }, string>({
      query: (id) => `/courses/${id}`,
      providesTags: ['CourseDetail'],
    }),

    // --- Outcomes ---
    getOutcomes: builder.query<{ success: boolean; data: CourseOutcome[] }, string>({
      query: (id) => `/courses/${id}/outcomes`,
      providesTags: ['Outcomes'],
    }),
    createOutcome: builder.mutation<{ success: boolean; data: CourseOutcome }, { id: string; description: string }>({
      query: ({ id, description }) => ({ url: `/courses/${id}/outcomes`, method: 'POST', body: { description } }),
      invalidatesTags: ['Outcomes'],
    }),
    deleteOutcome: builder.mutation<{ success: boolean }, { courseId: string; outcomeId: string }>({
      query: ({ courseId, outcomeId }) => ({ url: `/courses/${courseId}/outcomes/${outcomeId}`, method: 'DELETE' }),
      invalidatesTags: ['Outcomes'],
    }),

    // --- Announcements ---
    getAnnouncements: builder.query<{ success: boolean; data: CourseAnnouncement[] }, string>({
      query: (id) => `/courses/${id}/announcements`,
      providesTags: ['Announcements'],
    }),
    createAnnouncement: builder.mutation<{ success: boolean; data: CourseAnnouncement }, { id: string; title: string; content: string }>({
      query: ({ id, title, content }) => ({ url: `/courses/${id}/announcements`, method: 'POST', body: { title, content } }),
      invalidatesTags: ['Announcements'],
    }),
    deleteAnnouncement: builder.mutation<{ success: boolean }, { courseId: string; annId: string }>({
      query: ({ courseId, annId }) => ({ url: `/courses/${courseId}/announcements/${annId}`, method: 'DELETE' }),
      invalidatesTags: ['Announcements'],
    }),

    // --- Assignments ---
    getAssignments: builder.query<{ success: boolean; data: Assignment[] }, string>({
      query: (id) => `/courses/${id}/assignments`,
      providesTags: ['Assignments'],
    }),
    createAssignment: builder.mutation<{ success: boolean; data: Assignment }, { id: string; body: { title: string; description?: string; dueDate?: string; points?: number; rubricCriteriaJson?: string } }>({
      query: ({ id, body }) => ({ url: `/courses/${id}/assignments`, method: 'POST', body }),
      invalidatesTags: ['Assignments'],
    }),
    submitAssignment: builder.mutation<{ success: boolean; data: Submission }, { courseId: string; assignmentId: string; body: { content?: string; fileUrl?: string } }>({
      query: ({ courseId, assignmentId, body }) => ({ url: `/courses/${courseId}/assignments/${assignmentId}/submit`, method: 'POST', body }),
      invalidatesTags: ['Assignments'],
    }),
    gradeSubmission: builder.mutation<{ success: boolean; data: Submission }, { courseId: string; submissionId: string; body: { grade: number; feedback?: string } }>({
      query: ({ courseId, submissionId, body }) => ({ url: `/courses/${courseId}/submissions/${submissionId}/grade`, method: 'PUT', body }),
      invalidatesTags: ['Assignments'],
    }),

    // --- Discussions ---
    getTopics: builder.query<{ success: boolean; data: DiscussionTopic[] }, string>({
      query: (id) => `/courses/${id}/topics`,
      providesTags: ['Topics'],
    }),
    createTopic: builder.mutation<{ success: boolean; data: DiscussionTopic }, { id: string; title: string; content: string }>({
      query: ({ id, title, content }) => ({ url: `/courses/${id}/topics`, method: 'POST', body: { title, content } }),
      invalidatesTags: ['Topics'],
    }),
    getTopicPosts: builder.query<{ success: boolean; data: DiscussionPost[] }, { courseId: string; topicId: string }>({
      query: ({ courseId, topicId }) => `/courses/${courseId}/topics/${topicId}/posts`,
      providesTags: ['Posts'],
    }),
    createPost: builder.mutation<{ success: boolean; data: DiscussionPost }, { courseId: string; topicId: string; content: string }>({
      query: ({ courseId, topicId, content }) => ({ url: `/courses/${courseId}/topics/${topicId}/posts`, method: 'POST', body: { content } }),
      invalidatesTags: ['Posts'],
    }),

    // --- Agent ---
    getAgent: builder.query<{ success: boolean; data: CourseAgent | null }, string>({
      query: (id) => `/courses/${id}/agent`,
      providesTags: ['Agent'],
    }),
    updateAgent: builder.mutation<{ success: boolean; data: CourseAgent }, { id: string; body: { name: string; systemPrompt: string; isActive: boolean } }>({
      query: ({ id, body }) => ({ url: `/courses/${id}/agent`, method: 'PUT', body }),
      invalidatesTags: ['Agent'],
    }),
    chatWithAgent: builder.mutation<{ success: boolean; data: { response: string } }, { id: string; message: string }>({
      query: ({ id, message }) => ({ url: `/courses/${id}/agent/chat`, method: 'POST', body: { message } }),
    }),

    // --- Analytics ---
    getCourseAnalytics: builder.query<{ success: boolean; data: CourseAnalytics }, string>({
      query: (id) => `/courses/${id}/analytics`,
      providesTags: ['Analytics'],
    }),

    // --- Units ---
    getCourseUnits: builder.query<{ success: boolean; data: CourseUnit[] }, string>({
      query: (courseId) => `/courses/${courseId}/units`,
      providesTags: ['Units'],
    }),
    getUnit: builder.query<{ success: boolean; data: CourseUnit }, string>({
      query: (unitId) => `/units/${unitId}`,
      providesTags: ['Units'],
    }),
    createCourseUnit: builder.mutation<{ success: boolean; data: CourseUnit }, { courseId: string; title: string; description?: string }>({
      query: ({ courseId, ...body }) => ({ url: `/courses/${courseId}/units`, method: 'POST', body }),
      invalidatesTags: ['Units'],
    }),
    updateCourseUnit: builder.mutation<{ success: boolean; data: CourseUnit }, { unitId: string; body: Partial<Pick<CourseUnit, 'title' | 'description' | 'htmlContent' | 'cssContent' | 'jsContent' | 'isPublished' | 'order'>> }>({
      query: ({ unitId, body }) => ({ url: `/units/${unitId}`, method: 'PUT', body }),
      invalidatesTags: ['Units'],
    }),
    deleteCourseUnit: builder.mutation<{ success: boolean }, string>({
      query: (unitId) => ({ url: `/units/${unitId}`, method: 'DELETE' }),
      invalidatesTags: ['Units'],
    }),

    // --- Quizzes ---
    getUnitQuizzes: builder.query<{ success: boolean; data: Quiz[] }, string>({
      query: (unitId) => `/units/${unitId}/quizzes`,
      providesTags: ['Quizzes'],
    }),
    createQuiz: builder.mutation<{ success: boolean; data: Quiz }, { unitId: string; title: string; description?: string; timeLimit?: number; maxAttempts?: number }>({
      query: ({ unitId, ...body }) => ({ url: `/units/${unitId}/quizzes`, method: 'POST', body }),
      invalidatesTags: ['Quizzes', 'Units'],
    }),
    updateQuiz: builder.mutation<{ success: boolean; data: Quiz }, { quizId: string; body: Partial<Pick<Quiz, 'title' | 'description' | 'timeLimit' | 'maxAttempts' | 'isPublished'>> }>({
      query: ({ quizId, body }) => ({ url: `/quizzes/${quizId}`, method: 'PUT', body }),
      invalidatesTags: ['Quizzes'],
    }),
    deleteQuiz: builder.mutation<{ success: boolean }, string>({
      query: (quizId) => ({ url: `/quizzes/${quizId}`, method: 'DELETE' }),
      invalidatesTags: ['Quizzes', 'Units'],
    }),

    // --- Questions ---
    createQuizQuestion: builder.mutation<{ success: boolean; data: QuizQuestion }, { quizId: string; type: string; questionText: string; optionsJson?: string[]; correctAnswer?: string; points?: number }>({
      query: ({ quizId, ...body }) => ({ url: `/quizzes/${quizId}/questions`, method: 'POST', body }),
      invalidatesTags: ['Quizzes'],
    }),
    updateQuizQuestion: builder.mutation<{ success: boolean; data: QuizQuestion }, { questionId: string; body: Partial<QuizQuestion> }>({
      query: ({ questionId, body }) => ({ url: `/questions/${questionId}`, method: 'PUT', body }),
      invalidatesTags: ['Quizzes'],
    }),
    deleteQuizQuestion: builder.mutation<{ success: boolean }, string>({
      query: (questionId) => ({ url: `/questions/${questionId}`, method: 'DELETE' }),
      invalidatesTags: ['Quizzes'],
    }),

    // --- Attempts ---
    submitQuizAttempt: builder.mutation<{ success: boolean; data: QuizAttempt }, { quizId: string; answers: { questionId: string; answerText: string }[] }>({
      query: ({ quizId, answers }) => ({ url: `/quizzes/${quizId}/attempts`, method: 'POST', body: { answers } }),
      invalidatesTags: ['Attempts'],
    }),
    getQuizAttempts: builder.query<{ success: boolean; data: QuizAttempt[] }, string>({
      query: (quizId) => `/quizzes/${quizId}/attempts`,
      providesTags: ['Attempts'],
    }),
    gradeQuizAnswer: builder.mutation<{ success: boolean }, { answerId: string; pointsAwarded: number; feedback?: string }>({
      query: ({ answerId, ...body }) => ({ url: `/answers/${answerId}/grade`, method: 'PUT', body }),
      invalidatesTags: ['Attempts'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetOutcomesQuery,
  useCreateOutcomeMutation,
  useDeleteOutcomeMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
  useGetTopicsQuery,
  useCreateTopicMutation,
  useGetTopicPostsQuery,
  useCreatePostMutation,
  useGetAgentQuery,
  useUpdateAgentMutation,
  useChatWithAgentMutation,
  useGetCourseAnalyticsQuery,
  // Units
  useGetCourseUnitsQuery,
  useGetUnitQuery,
  useCreateCourseUnitMutation,
  useUpdateCourseUnitMutation,
  useDeleteCourseUnitMutation,
  // Quizzes
  useGetUnitQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  // Questions
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  // Attempts
  useSubmitQuizAttemptMutation,
  useGetQuizAttemptsQuery,
  useGradeQuizAnswerMutation,
} = courseApi;
