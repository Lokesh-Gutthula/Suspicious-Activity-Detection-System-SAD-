import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import {
  Mail,
  User,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Register, 2: OTP
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_no: '',
    address: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  // Validation
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const validatePhoneNo = (phone) => /^[6-9]\d{9}$/.test(phone);
  const validatePassword = (pw) => pw.length >= 8;
  const validateOtp = (otp) => /^\d{6}$/.test(otp);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let newErrors = { ...errors };
    if (name === 'email') {
      !validateEmail(value)
        ? (newErrors.email = 'Please use a valid Gmail address')
        : delete newErrors.email;
    }
    if (name === 'phone_no') {
      !validatePhoneNo(value)
        ? (newErrors.phone_no = 'Phone number must be 10 digits')
        : delete newErrors.phone_no;
    }
    if (name === 'password') {
      !validatePassword(value)
        ? (newErrors.password = 'Password must be at least 8 characters')
        : delete newErrors.password;
    }

    setErrors(newErrors);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    let validationErrors = {};
    if (!formData.username) validationErrors.username = 'Name is required';
    if (!formData.email || !validateEmail(formData.email)) validationErrors.email = 'Valid Gmail is required';
    if (!formData.password || !validatePassword(formData.password)) validationErrors.password = 'Password must be at least 8 characters';
    if (formData.phone_no && !validatePhoneNo(formData.phone_no)) validationErrors.phone_no = 'Invalid phone number';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', formData);
      setStep(2);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!otp || !validateOtp(otp)) {
      setErrors({ otp: 'Valid 6-digit OTP is required' });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp,
      });

      handleLogin(res.data.access_token, res.data.refresh_token);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'OTP verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-blue-50 py-4 px-4 sm:px-6 lg:px-8">

        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">AI Surveillance System</h1>
            <p className="mt-2 text-gray-600">
              {step === 1 ? 'Register your account' : `OTP Verification for ${formData.email}`}
            </p>
          </div>

          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium">{step === 1 ? 'Sign Up' : 'Enter OTP'}</h2>
              <p className="text-sm text-gray-500">
                {step === 1 ? 'Enter your information to create an account' : 'A 6-digit OTP was sent to your email'}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6 pt-0">
              {errors.api && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{errors.api}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@gmail.com"
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="pl-10 pr-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {errors.phone_no && <p className="text-sm text-red-500 mt-1">{errors.phone_no}</p>}
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address (optional)"
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    {errors.otp && <p className="text-sm text-red-500 mt-1">{errors.otp}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}
            </div>

            <div className="px-4 py-4 sm:px-6 bg-gray-50 rounded-b-lg text-center">
              <p className="text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
