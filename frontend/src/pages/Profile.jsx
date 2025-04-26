import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api'; // Updated imports
import Navbar from '../components/Navbar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState('');
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await api.get('/user/profile');
        console.log(data)
        setProfile(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          phone_no: data.phone_no || '',
          address: data.address || '',
          picture: null,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    const data = new FormData();
    for (const key in formData) {
      if (formData[key] && key !== 'picture') {
        data.append(key, formData[key]);
      }
    }
    if (formData.picture) {
      data.append('picture', formData.picture);
    }
  
    try {
      console.log('FormData being sent:');
      for (let [key, value] of data.entries()) {
        console.log(`${key}:`, value); // Debug FormData contents
      }
      const { data: updatedData } = await api.patch('/user/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Optional, axios sets this automatically with FormData
      });
      setProfile({ ...profile, ...updatedData.user });
      setSuccess(updatedData.message || 'Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="text-center p-8 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
            <p className="mt-4 text-white text-xl font-semibold">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <div className="text-red-500 bg-red-100 p-4 rounded-lg text-lg mb-4">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 px-4 sm:px-6 md:px-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-4xl mx-auto backdrop-blur-xl bg-opacity-95 border border-white/20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 pb-2">My Profile</h1>

          {success && (
            <div className="mb-6 text-center">
              <p className="text-green-600 bg-green-100 p-3 rounded-lg text-lg font-medium animate-pulse">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 text-center">
              <p className="text-red-600 bg-red-100 p-3 rounded-lg text-lg font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
            {/* Profile Picture Section */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={profile?.picture ? `http://127.0.0.1:5000/serve/profile/${profile.picture}` : defaultImage}
                  alt="Profile"
                  className="w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-purple-200 shadow-xl transition duration-300 group-hover:border-purple-400"
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-lg font-medium">Change Photo</span>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4 w-full max-w-xs">
                  <label className="block text-sm font-medium text-indigo-700 mb-2">Upload New Picture</label>
                  <input
                    type="file"
                    name="picture"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-300 rounded-lg p-1"
                  />
                </div>
              )}
              
              {!isEditing && (
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {profile?.first_name} {profile?.username}
                  </h2>
                  <p className="text-indigo-600 font-medium">{profile?.role} {profile?.year}</p>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">User Name</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 py-2.5"
                        placeholder="Your last name"
                      />
                    </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 py-2.5"
                      placeholder="Your phone number"
                    />
                  </div>
                
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200"
                      placeholder="Your address"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300 font-medium text-lg shadow-md hover:shadow-lg ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition duration-300 font-medium text-lg shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm uppercase text-indigo-700 font-semibold mb-1">Email</h3>
                      <p className="text-lg text-gray-900">{profile?.email || 'Not provided'}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-sm uppercase text-indigo-700 font-semibold mb-1">Phone</h3>
                      <p className="text-lg text-gray-900">{profile?.phone_no || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm uppercase text-indigo-700 font-semibold mb-1">Address</h3>
                    <p className="text-lg text-gray-900">{profile?.address || 'Not provided'}</p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;