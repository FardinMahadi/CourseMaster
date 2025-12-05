import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Include cookies in requests
});

// Request interceptor - runs before every request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token if available (for additional security)
    // Note: Since we're using HTTP-only cookies, the token is automatically sent
    // But we can add additional security headers here

    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
axiosInstance.interceptors.response.use(
  response => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    // Return successful response
    return response;
  },
  (error: AxiosError) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    // Note: We do NOT redirect here - let Redux handle auth state gracefully
    // The /auth/me endpoint is expected to return 401 for unauthenticated users
    if (error.response?.status === 401) {
      // Just reject the promise - calling code will handle it
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - Access denied
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        // Redirect to appropriate page based on user role
        // For now, redirect to home
        window.location.href = '/';
      }

      return Promise.reject(error);
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter
        ? `Too many requests. Please try again after ${retryAfter} seconds.`
        : 'Too many requests. Please try again later.';

      return Promise.reject({
        ...error,
        message,
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
      });
    }

    // Handle other errors - format error message
    const errorMessage =
      (error.response.data as { error?: string })?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default axiosInstance;
export { axiosInstance as api };
