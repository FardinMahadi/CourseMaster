import type {
  Assignment,
  AssignmentSubmission,
  AssignmentWithSubmission,
} from '@/types/student.types';

import api from './axios';

export interface GetAssignmentsResponse {
  data: {
    assignments: AssignmentWithSubmission[];
  };
}

export interface GetAssignmentResponse {
  data: {
    assignment: Assignment;
    submission?: AssignmentSubmission;
  };
}

export interface SubmitAssignmentResponse {
  message: string;
  data: AssignmentSubmission;
}

export interface SubmitAssignmentInput {
  assignmentId: string;
  submissionText?: string;
  submissionUrl?: string;
}

/**
 * Get assignments for enrolled courses
 */
export async function getAssignments(
  courseId?: string,
  lessonId?: string
): Promise<GetAssignmentsResponse> {
  const params = new URLSearchParams();

  if (courseId) {
    params.append('courseId', courseId);
  }

  if (lessonId) {
    params.append('lessonId', lessonId);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/assignments?${queryString}` : '/api/assignments';

  const response = await api.get<GetAssignmentsResponse>(url);

  return response.data;
}

/**
 * Get assignment details with submission status
 */
export async function getAssignment(id: string): Promise<GetAssignmentResponse> {
  const response = await api.get<GetAssignmentResponse>(`/api/assignments/${id}`);

  return response.data;
}

/**
 * Submit an assignment
 */
export async function submitAssignment(
  data: SubmitAssignmentInput
): Promise<SubmitAssignmentResponse> {
  const response = await api.post<SubmitAssignmentResponse>('/api/assignments', data);

  return response.data;
}
