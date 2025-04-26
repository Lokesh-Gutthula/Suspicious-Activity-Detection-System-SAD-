import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

import api from '../../api';
import Navbar from '../../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      const decodedToken = jwtDecode(accessToken);
      console.log(decodedToken, "oh");
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium">Login</h2>
              <p className="text-sm text-gray-500">Enter your credentials to access the dashboard</p>
            </div>

            <div className="px-4 py-5 sm:p-6 pt-0">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Campus Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>

            <div className="px-4 py-4 sm:px-6 bg-gray-50 rounded-b-lg flex justify-between">
              <a href="/reset-password" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot Password?
              </a>
              <a href="/register" className="text-sm text-blue-600 hover:text-blue-800">
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
