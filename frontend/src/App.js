import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import ViewStudents from './pages/ViewStudents';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import StudentDashboard from './pages/StudentDashboard';
import AdminMarks from './pages/AdminMarks';
import AdminAttendance from './pages/AdminAttendance';
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';

// Protected Route component to check authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Student Protected Route - checks for student token
const StudentProtectedRoute = ({ children }) => {
  const studentToken = localStorage.getItem('studentToken');
  return studentToken ? children : <Navigate to="/student/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
            <ParticleBackground />
            <div className="relative z-10">
              <Navbar />
              <Routes>
                {/* Admin Routes */}
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <ViewStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/add"
                  element={
                    <ProtectedRoute>
                      <AddStudent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EditStudent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/marks"
                  element={
                    <ProtectedRoute>
                      <AdminMarks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/attendance"
                  element={
                    <ProtectedRoute>
                      <AdminAttendance />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/register" element={<StudentRegister />} />
                <Route
                  path="/student/dashboard"
                  element={
                    <StudentProtectedRoute>
                      <StudentDashboard />
                    </StudentProtectedRoute>
                  }
                />

                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
