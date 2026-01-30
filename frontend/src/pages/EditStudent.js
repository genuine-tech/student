import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../utils/api';
import { studentValidationRules, validateForm } from '../utils/validation';
// Edit Student page component for updating existing student information
const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    gender: '',
    dob: '',
    city: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);

  // Fetch student data on component mount
  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch student data by ID
  const fetchStudent = async () => {
    try {
      setIsLoadingStudent(true);

      const response = await studentAPI.getStudentById(id);
      const student = response.data.data;

      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        gender: student.gender,
        dob: student.dob,
        city: student.city
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      setErrors({ general: 'Failed to load student data' });
    } finally {
      setIsLoadingStudent(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validation = validateForm(formData, studentValidationRules);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await studentAPI.updateStudent(id, formData);

      if (response.data.success) {
        alert('Student updated successfully!');
        navigate('/students');
      } else {
        setErrors({ general: response.data.message || 'Failed to update student' });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update student. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate('/students');
  };

  // Loading state while fetching student data
  if (isLoadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Edit Student</h1>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-200">
            Update the student information below
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Course Field */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">
                  Course *
                </label>
                <select
                  name="course"
                  id="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.course ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                >
                  <option value="">Select a course</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                </select>
                {errors.course && (
                  <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                )}
              </div>

              {/* Gender Field */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">Gender</label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.gender ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                >
                  <option value="">Select gender (optional)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              {/* DOB Field */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.dob ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
                {errors.dob && (
                  <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                )}
              </div>

              {/* City Field */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.city ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white dark:bg-gray-700 py-2 px-6 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Updating...' : 'Update Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
