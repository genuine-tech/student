import React, { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI, subjectAPI } from '../utils/api';

const AdminAttendance = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
    fetchAttendance();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAllStudents();
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAllSubjects();
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAllAttendance();
      setAttendance(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: status
    });
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(student => {
      allPresent[student.id] = 'Present';
    });
    setAttendanceRecords(allPresent);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      setMessage({ type: 'error', text: 'Please select a subject' });
      return;
    }

    try {
      const attendanceData = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        subjectId: parseInt(selectedSubject),
        attendanceDate: selectedDate,
        status: status
      }));

      // Submit all attendance records
      for (const record of attendanceData) {
        await attendanceAPI.markAttendance(record);
      }

      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      setAttendanceRecords({});
      fetchAttendance();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to mark attendance' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceAPI.deleteAttendance(id);
        setMessage({ type: 'success', text: 'Attendance deleted successfully!' });
        fetchAttendance();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete attendance' });
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Manage Student Attendance
        </h1>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Mark Attendance Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Mark Attendance
          </h2>
          
          <form onSubmit={handleSubmitAttendance}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={markAllPresent}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Mark All Present
              </button>
            </div>

            {/* Students List */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.rollNumber} - {student.course}</p>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value="Present"
                        checked={attendanceRecords[student.id] === 'Present'}
                        onChange={() => handleStatusChange(student.id, 'Present')}
                        className="mr-2"
                      />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Present</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value="Absent"
                        checked={attendanceRecords[student.id] === 'Absent'}
                        onChange={() => handleStatusChange(student.id, 'Absent')}
                        className="mr-2"
                      />
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">Absent</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value="Late"
                        checked={attendanceRecords[student.id] === 'Late'}
                        onChange={() => handleStatusChange(student.id, 'Late')}
                        className="mr-2"
                      />
                      <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Late</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Submit Attendance
            </button>
          </form>
        </div>

        {/* Attendance History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendance.length > 0 ? (
                  attendance.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.attendanceDate ? new Date(record.attendanceDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No attendance records found
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

export default AdminAttendance;
