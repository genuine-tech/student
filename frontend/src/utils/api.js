import axios from 'axios';

// ========================================
// API Configuration
// ========================================

// Base URL for API calls - Use environment variable or fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/student-management/api';

// Log API URL in development (helps debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Create axios instance with production-ready configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds (Render cold start can take time)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable credentials for CORS
  withCredentials: false,
});

// ========================================
// Request Interceptor
// ========================================
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ========================================
// Response Interceptor
// ========================================
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      if (status === 401) {
        // Handle unauthorized access
        console.warn('🔒 Unauthorized - Redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('studentData');
        localStorage.removeItem('studentToken');

        // Redirect based on current path
        const currentPath = window.location.pathname;
        if (currentPath.includes('/student')) {
          window.location.href = '/student/login';
        } else {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('🚫 Forbidden - Access denied');
      } else if (status === 404) {
        console.error('❓ Not Found - Resource does not exist');
      } else if (status >= 500) {
        console.error('🔥 Server Error - Please try again later');
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Response Error [${status}]:`, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response (network error, CORS, timeout)
      console.error('🌐 Network Error - Cannot reach server');
      console.error('Check if backend is running and CORS is configured correctly');

      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Request Timeout - Server took too long to respond');
      }
    } else {
      // Something else happened
      console.error('⚠️ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API functions for student management
export const studentAPI = {
  // Get all students
  getAllStudents: () => api.get('/students'),

  // Get student by ID
  getStudentById: (id) => api.get(`/students/${id}`),

  // Add new student
  addStudent: (studentData) => api.post('/students', studentData),

  // Update student
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),

  // Delete student
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

// API functions for dashboard statistics
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/dashboard/stats'),
};

// Student authentication API
export const studentAuthAPI = {
  login: (credentials) => api.post('/student/auth/login', credentials),
  register: (studentData) => api.post('/student/auth/register', studentData),
  checkRegistration: (emailOrRoll) => api.get('/student/auth/check-registration', {
    params: { emailOrRoll }
  }),
};

// Marks API
export const marksAPI = {
  getByStudentId: (studentId) => api.get(`/marks/student/${studentId}`),
  getAllMarks: () => api.get('/marks'),
  addMarks: (data) => api.post('/marks', data),
  updateMarks: (id, data) => api.put(`/marks/${id}`, data),
  deleteMarks: (id) => api.delete(`/marks/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getByStudentId: (studentId) => api.get(`/attendance/student/${studentId}`),
  getPercentage: (studentId) => api.get(`/attendance/student/${studentId}/percentage`),
  getAllAttendance: () => api.get('/attendance'),
  markAttendance: (data) => api.post('/attendance', data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
};

// Subjects API
export const subjectAPI = {
  getAllSubjects: () => api.get('/subjects'),
  getSubjectsByCourse: (course) => api.get(`/subjects/course/${course}`),
};

export default api;
