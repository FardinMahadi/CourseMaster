import type { AxiosError } from 'axios';

import api from './axios';

export interface Enrollment {
  _id: string;
  student: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    category: string;
    duration?: number;
    level?: string;
  };
  batch?: string;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollmentResponse {
  message: string;
  data: Enrollment;
}

export interface GetEnrollmentsResponse {
  data: {
    enrollments: Enrollment[];
  };
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(courseId: string, batchId?: string): Promise<Enrollment> {
  try {
    const response = await api.post<CreateEnrollmentResponse>('/enrollments', {
      courseId,
      batchId,
    });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string; details?: string }>;

    // Handle specific error cases
    if (axiosError.response?.status === 401) {
      throw new Error('Unauthorized: Please log in to enroll in courses');
    }

    if (axiosError.response?.status === 403) {
      const errorMsg =
        axiosError.response?.data?.error || 'You do not have permission to enroll in this course';
      throw new Error(errorMsg);
    }

    if (axiosError.response?.status === 409) {
      const errorMsg =
        axiosError.response?.data?.error || 'You are already enrolled in this course';
      throw new Error(errorMsg);
    }

    // Extract error message
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.details ||
      axiosError.message ||
      'Failed to enroll in course. Please try again.';

    throw new Error(errorMessage);
  }
}

/**
 * Check if user is enrolled in a specific course
 */
export async function checkEnrollment(courseId: string): Promise<Enrollment | null> {
  try {
    const response = await api.get<GetEnrollmentsResponse>(`/enrollments?courseId=${courseId}`);
    const enrollments = response.data.data.enrollments;
    return enrollments.length > 0 ? enrollments[0] : null;
  } catch (error) {
    // If 401, user is not authenticated, return null
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      return null;
    }
    // For other errors, log and return null
    console.error('Error checking enrollment:', error);
    return null;
  }
}

/**
 * Get all enrollments for the current user
 */
export async function getEnrollments(
  status?: 'enrolled' | 'completed' | 'dropped'
): Promise<Enrollment[]> {
  try {
    const url = status ? `/enrollments?status=${status}` : '/enrollments';
    const response = await api.get<GetEnrollmentsResponse>(url);
    return response.data.data.enrollments;
  } catch (error) {
    const axiosError = error as AxiosError<{ error: string }>;
    const errorMessage =
      axiosError.response?.data?.error || axiosError.message || 'Failed to fetch enrollments';
    throw new Error(errorMessage);
  }
}
