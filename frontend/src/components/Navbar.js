import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';

// Navigation bar component with authentication controls
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout functionality
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Student Management System
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/students"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Students
                </Link>
                <Link
                  to="/students/add"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Add Student
                </Link>
                <Link
                  to="/admin/marks"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Manage Marks
                </Link>
                <Link
                  to="/admin/attendance"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Manage Attendance
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Welcome, {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/student/login"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Student Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
