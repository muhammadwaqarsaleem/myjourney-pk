import axios from 'axios';

// Base API client configured with credentials for cross-origin cookie sharing
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error responses without exposing internal stack traces
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let sanitizedMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      sanitizedMessage = 'Network error: Unable to reach the server. Please check your connection.';
    } else {
      const { status, data } = error.response;

      if (data && typeof data.message === 'string' && data.message.trim()) {
        sanitizedMessage = data.message;
      } else if (data && Array.isArray(data.errors) && data.errors.length > 0) {
        sanitizedMessage = data.errors.map((e) => e.message || e).join(', ');
      } else if (status === 400) {
        sanitizedMessage = 'Invalid request. Please verify the submitted data.';
      } else if (status === 401) {
        sanitizedMessage = 'Session expired or unauthenticated. Please log in.';
      } else if (status === 403) {
        sanitizedMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        sanitizedMessage = 'The requested resource was not found.';
      } else if (status >= 500) {
        sanitizedMessage = 'Internal server error. Please try again later.';
      }
    }

    const normalizedError = new Error(sanitizedMessage);
    normalizedError.status = error.response?.status;
    normalizedError.originalError = undefined;

    return Promise.reject(normalizedError);
  }
);

export default api;
