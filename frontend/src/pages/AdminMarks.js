import React, { useState, useEffect } from 'react';
import { studentAPI, marksAPI, subjectAPI } from '../utils/api';

const AdminMarks = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    marksObtained: '',
    totalMarks: '',
    examType: 'Regular',
    examDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
    fetchMarks();
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

  const fetchMarks = async () => {
    try {
      const response = await marksAPI.getAllMarks();
      setMarks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await marksAPI.updateMarks(editingId, formData);
        setMessage({ type: 'success', text: 'Marks updated successfully!' });
      } else {
        await marksAPI.addMarks(formData);
        setMessage({ type: 'success', text: 'Marks added successfully!' });
      }
      resetForm();
      fetchMarks();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save marks' });
    }
  };

  const handleEdit = (mark) => {
    setFormData({
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      marksObtained: mark.marksObtained,
      totalMarks: mark.totalMarks,
      examType: mark.examType,
      examDate: mark.examDate ? mark.examDate.split('T')[0] : ''
    });
    setEditingId(mark.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await marksAPI.deleteMarks(id);
        setMessage({ type: 'success', text: 'Marks deleted successfully!' });
        fetchMarks();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete marks' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      subjectId: '',
      marksObtained: '',
      totalMarks: '',
      examType: 'Regular',
      examDate: ''
    });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Manage Student Marks
        </h1>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Marks' : 'Add New Marks'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marks Obtained
              </label>
              <input
                type="number"
                name="marksObtained"
                value={formData.marksObtained}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Type
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="Regular">Regular</option>
                <option value="Mid-term">Mid-term</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                {editingId ? 'Update Marks' : 'Add Marks'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Marks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Marks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Exam Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {marks.length > 0 ? (
                  marks.map(mark => (
                    <tr key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mark.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mark.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mark.marksObtained} / {mark.totalMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          mark.percentage >= 90 ? 'bg-green-100 text-green-800' :
                          mark.percentage >= 75 ? 'bg-blue-100 text-blue-800' :
                          mark.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {mark.percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mark.examType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mark.examDate ? new Date(mark.examDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(mark)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mark.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No marks records found
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

export default AdminMarks;
