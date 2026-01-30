import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI, studentAuthAPI } from '../utils/api';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    rollNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleVerifyStudent = async (e) => {
    e.preventDefault();

    if (!formData.rollNumber && !formData.email) {
      setError('Please enter either Roll Number or Email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const emailOrRoll = formData.rollNumber || formData.email;
      const response = await studentAuthAPI.checkRegistration(emailOrRoll);

      if (!response.data.success) {
        setError(response.data.message || 'Student not found. Please contact admin to add you first.');
        return;
      }

      const data = response.data.data;

      // Allow both registration AND password reset
      // Remove the check that blocked already registered students

      // Set student data for step 2
      setStudentData({
        id: data.studentId,
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber,
        course: data.course,
        isRegistered: data.isRegistered
      });
      setStep(2);
    } catch (err) {
      console.error('Verification error:', err);
      if (err.response?.status === 404) {
        setError('Student not found. Please contact admin to add you first.');
      } else {
        setError('Failed to verify student. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, get the complete student data from the API
      const studentResponse = await studentAPI.getStudentById(studentData.id);
      const fullStudentData = studentResponse.data.data;

      // Update with new password
      const updateData = {
        ...fullStudentData,
        password: formData.password
      };

      await studentAPI.updateStudent(studentData.id, updateData);

      const actionType = studentData.isRegistered ? 'Password reset' : 'Registration';
      alert(`${actionType} successful!\n\nYour Roll Number: ${studentData.rollNumber}\nYou can now login with your Roll Number or Email and new password.`);
      navigate('/student/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Student Registration / Password Reset
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {step === 1 ? 'Verify your identity' : 'Set your new password'}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Verify</span>
              </div>
              <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Password</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleVerifyStudent} className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> This page works for both new registration and password reset. Enter your Roll Number or Email to verify your identity.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="e.g., STU0001"
                />
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                OR
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {step === 2 && studentData && (
            <form onSubmit={handleSetPassword} className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                  <strong>✓ Student Verified!</strong>
                  {studentData.isRegistered && (
                    <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                      Password Reset Mode
                    </span>
                  )}
                </p>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <p><strong>Name:</strong> {studentData.name}</p>
                  <p><strong>Roll Number:</strong> {studentData.rollNumber}</p>
                  <p><strong>Course:</strong> {studentData.course}</p>
                  <p><strong>Email:</strong> {studentData.email}</p>
                  {studentData.isRegistered && (
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      <strong>Note:</strong> You are resetting your password. Your old password will be replaced.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {studentData.isRegistered ? 'New Password *' : 'Set Password *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Re-enter password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setStudentData(null);
                    setFormData({ rollNumber: '', email: '', password: '', confirmPassword: '' });
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {studentData?.isRegistered ? 'Resetting Password...' : 'Registering...'}
                    </span>
                  ) : (
                    studentData?.isRegistered ? 'Reset Password' : 'Complete Registration'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Want to login?{' '}
              <Link
                to="/student/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Go to login page
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
