import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_password: '',
    otp: '',
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

  const validateEmailForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }

    if (!formData.new_password || !formData.confirm_password) {
      setError('All fields are required');
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const validateOtpForm = () => {
    if (!formData.otp) {
      setError('OTP is required');
      return false;
    }

    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return false;
    }

    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmailForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', {
        email: formData.email,
        new_password: formData.new_password,
      });
      
      setSuccess(data.message || 'OTP sent to your email');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateOtpForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/password-otp-verify', {
        email: formData.email,
        otp: formData.otp,
      });
      
      setSuccess(data.message || 'Password reset successfully');
      setStep(3); // Move to success step
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', {
        email: formData.email,
        new_password: formData.new_password,
      });
      
      setSuccess(data.message || 'OTP re-sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
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
              Reset Password
            </h1>

            {success && (
              <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded animate-pulse">
                <p className="font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your email address"
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
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      'Request OTP'
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="border-2 border-indigo-100 rounded-lg p-4 bg-indigo-50">
                    <p className="text-gray-700">
                      We've sent a 6-digit OTP to <span className="font-semibold">{formData.email}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please check your email and enter the code below
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="● ● ● ● ● ●"
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
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg className="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
                <p className="text-gray-600 mb-8">
                  Your password has been successfully reset. You will be redirected to the login page.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Login Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;