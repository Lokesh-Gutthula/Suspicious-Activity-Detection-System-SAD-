import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
      setError('All fields are required');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return false;
    }
    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('old_password', formData.old_password);
      formDataObj.append('new_password', formData.new_password);

      console.log('Sending data:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value}`);
      }

      const { data } = await api.patch('/auth/change-password', formDataObj);
      setSuccess(data.message || 'Password changed successfully');
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error('Error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
              Change Password
            </h1>

            {success && (
              <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                <p className="font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="old_password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Back to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;