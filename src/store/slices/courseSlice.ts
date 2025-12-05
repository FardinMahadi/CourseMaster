import type { Course } from '@/types/course.types';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    category?: string;
    level?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.level) queryParams.append('level', params.level);

    const response = await fetch(`/api/courses?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    const data = await response.json();
    return data.data;
  }
);

export const fetchCourse = createAsyncThunk('course/fetchCourse', async (courseId: string) => {
  const response = await fetch(`/api/courses/${courseId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch course');
  }
  const data = await response.json();
  return data.data;
});

export const createCourse = createAsyncThunk('course/createCourse', async (courseData: unknown) => {
  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create course');
  }
  const data = await response.json();
  return data.data;
});

export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: unknown }) => {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update course');
    }
    const data = await response.json();
    return data.data;
  }
);

export const deleteCourse = createAsyncThunk('course/deleteCourse', async (courseId: string) => {
  const response = await fetch(`/api/courses/${courseId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete course');
  }
  return courseId;
});

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearCurrentCourse: state => {
      state.currentCourse = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch courses
    builder
      .addCase(fetchCourses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      });

    // Fetch single course
    builder
      .addCase(fetchCourse.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch course';
      });

    // Create course
    builder
      .addCase(createCourse.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create course';
      });

    // Update course
    builder
      .addCase(updateCourse.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update course';
      });

    // Delete course
    builder
      .addCase(deleteCourse.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(c => c._id !== action.payload);
        if (state.currentCourse?._id === action.payload) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete course';
      });
  },
});

export const { clearCurrentCourse, clearError } = courseSlice.actions;
export default courseSlice.reducer;
