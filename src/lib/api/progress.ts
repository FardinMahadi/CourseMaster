import type { CourseProgress, Progress, ProgressUpdate } from '@/types/student.types';

import api from './axios';

export interface UpdateProgressResponse {
  message: string;
  data: Progress;
}

export interface GetProgressResponse {
  data: {
    progress: Progress[];
    courseProgress: CourseProgress | null;
  };
}

/**
 * Update or create progress for a lesson
 */
export async function updateProgress(
  courseId: string,
  lessonId: string,
  data: Partial<ProgressUpdate>
): Promise<UpdateProgressResponse> {
  const response = await api.post<UpdateProgressResponse>('/api/progress', {
    courseId,
    lessonId,
    isCompleted: data.isCompleted ?? false,
    timeSpent: data.timeSpent ?? 0,
  });

  return response.data;
}

/**
 * Get progress records for the current student
 */
export async function getProgress(
  courseId?: string,
  lessonId?: string
): Promise<GetProgressResponse> {
  const params = new URLSearchParams();

  if (courseId) {
    params.append('courseId', courseId);
  }

  if (lessonId) {
    params.append('lessonId', lessonId);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/progress?${queryString}` : '/api/progress';

  const response = await api.get<GetProgressResponse>(url);

  return response.data;
}

/**
 * Get course completion percentage
 */
export async function getCourseProgress(courseId: string): Promise<CourseProgress | null> {
  const response = await getProgress(courseId);

  return response.data.courseProgress;
}
