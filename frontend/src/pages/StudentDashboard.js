import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marksAPI, attendanceAPI, subjectAPI } from '../utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [, setAttendance] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState({});
  const [, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('studentData');
    if (!studentData) {
      navigate('/student/login');
      return;
    }

    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);
    fetchData(parsedStudent.id);
  }, [navigate]);

  const fetchData = async (studentId) => {
    try {
      setIsLoading(true);

      // Fetch marks
      const marksResponse = await marksAPI.getByStudentId(studentId);
      setMarks(marksResponse.data.data || []);

      // Fetch attendance
      const attendanceResponse = await attendanceAPI.getByStudentId(studentId);
      setAttendance(attendanceResponse.data.data || []);

      // Fetch attendance percentage
      const percentageResponse = await attendanceAPI.getPercentage(studentId);
      setAttendancePercentage(percentageResponse.data.data || {});

      // Fetch subjects
      const subjectsResponse = await subjectAPI.getAllSubjects();
      setSubjects(subjectsResponse.data.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    localStorage.removeItem('studentToken');
    navigate('/student/login');
  };

  // Calculate average marks
  const calculateAverageMarks = () => {
    if (marks.length === 0) return 0;
    const total = marks.reduce((sum, mark) => sum + mark.percentage, 0);
    return (total / marks.length).toFixed(2);
  };

  // Calculate overall attendance
  const calculateOverallAttendance = () => {
    if (Object.keys(attendancePercentage).length === 0) return 0;
    const values = Object.values(attendancePercentage);
    const total = values.reduce((sum, val) => sum + val, 0);
    return (total / values.length).toFixed(2);
  };

  // Group marks by exam type and prepare chart data
  const groupMarksByExamType = () => {
    const grouped = {};
    marks.forEach(mark => {
      const examType = mark.examType || 'Other';
      if (!grouped[examType]) {
        grouped[examType] = [];
      }
      grouped[examType].push({
        subject: mark.subjectName || mark.subjectCode,
        marks: mark.marksObtained,
        total: mark.totalMarks,
        percentage: mark.percentage.toFixed(2),
        examDate: mark.examDate
      });
    });
    return grouped;
  };

  const marksByExamType = groupMarksByExamType();
  const examTypes = Object.keys(marksByExamType).sort();

  // Prepare attendance pie chart data with subject names
  // Note: attendancePercentage already has subject names as keys, not codes
  const attendancePieData = Object.entries(attendancePercentage).map(([subjectName, percentage]) => ({
    name: subjectName,
    value: parseFloat(percentage.toFixed(2))
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
              Student Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-200">
              Welcome, {student?.name}!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Roll Number: {student?.rollNumber} | Course: {student?.course}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Marks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculateAverageMarks()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculateOverallAttendance()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{marks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{marks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts - Marks by Exam Type */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Marks by Exam Type</h2>
          {examTypes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {examTypes.map((examType) => (
                <div key={examType} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {examType} Exam - Marks by Subject
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={marksByExamType[examType]} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="subject"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="marks" fill="#3B82F6" name="Marks Obtained" />
                      <Bar dataKey="total" fill="#10B981" name="Total Marks" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">No marks data available</p>
            </div>
          )}
        </div>

        {/* Attendance Pie Chart */}
        <div className="mb-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Attendance by Subject</h3>
            {attendancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">No attendance data available</p>
            )}
          </div>
        </div>

        {/* Recent Marks Table */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Exam Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Exam Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {marks.length > 0 ? (
                  marks.map((mark) => (
                    <tr key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {mark.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {mark.examType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {mark.marksObtained} / {mark.totalMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${mark.percentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          mark.percentage >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            mark.percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                          {mark.percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {mark.examDate ? new Date(mark.examDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No exam results available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
