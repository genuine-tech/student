import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
// Dashboard page component showing statistics and overview
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 8, // Total available courses in the system
    activeCourses: 0, // Courses currently being taken by students
    recentStudents: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics on component mount and when page becomes visible
  useEffect(() => {
    fetchStats();

    // Refresh data when user comes back to the page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fetch dashboard statistics from API
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Call the dedicated dashboard stats endpoint
      const response = await dashboardAPI.getStats();
      const data = response.data?.data || {};

      // Map returned stats into the component state shape
      setStats({
        totalStudents: data.totalStudents || 0,
        totalCourses: data.totalCourses || 0,
        activeCourses: data.activeStudents || 0,
        recentStudents: Array.isArray(data.recentStudents) ? data.recentStudents.slice(0, 5) : []
      });
    } catch (err) {
      // Prefer backend-provided error message when available
      const backendMessage = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard data';
      setError(backendMessage);
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-200">
            Welcome to the Student Management System
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate font-semibold">
                      Total Students
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white font-bold text-2xl">
                      {stats.totalStudents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate font-semibold">
                      Total Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white font-bold text-2xl">
                      {stats.totalCourses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate font-semibold">
                      Active Students
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white font-bold text-2xl">
                      {stats.totalStudents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate font-semibold">
                      Active Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white font-bold text-2xl">
                      {stats.activeCourses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/students/add"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Student
                </Link>
                <Link
                  to="/students"
                  className="w-full bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Students
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Recent Students
              </h3>
              <div className="space-y-3">
                {stats.recentStudents.length > 0 ? (
                  stats.recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.course}</p>
                      </div>
                      <Link
                        to={`/students/edit/${student.id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recent students</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
