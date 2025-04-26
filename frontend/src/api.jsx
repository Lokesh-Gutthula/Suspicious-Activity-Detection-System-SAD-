// src/api.jsx
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});


let accessToken = localStorage.getItem('access_token') || null;
let refreshToken = localStorage.getItem('refresh_token') || null;

// set tokens in localstorage and header
export const setTokens = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  localStorage.setItem('access_token', newAccessToken);
  localStorage.setItem('refresh_token', newRefreshToken);
  api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
};

// clear tokens in localstorage and header
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete api.defaults.headers.common['Authorization'];
};


// Request interceptor to add token for every request
api.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      
      try {
        const { data } = await api.post(`/refresh`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        
        setTokens(data.access_token, refreshToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login'; // Redirect to login on refresh failure
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;





// API Methods

export const logout = async () => {
  await api.post('/logout');
  clearTokens();
};

export const getProfile = async () => {
  return api.get('/profile');
};

export const updateProfile = async (formData) => {
  return api.patch('/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const changePassword = async (oldPassword, newPassword) => {
  const formData = new FormData();
  formData.append('old_password', oldPassword);
  formData.append('new_password', newPassword);
  return api.patch('/change-password', formData);
};

export const resetPassword = async (email, newPassword) => {
  return api.post('/reset-password', { email, new_password: newPassword });
};

export const verifyPasswordOtp = async (email, otp) => {
  return api.post('/password-otp-verify', { email, otp });
};

// Helper function to handle file uploads
export const createFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const startMonitoring = async (streamName, streamUrl) => {
  try {
    const response = await api.post(`/live/start`, {
      stream_name: streamName,
      stream_url: streamUrl
    });
    return response.data;
  } catch (error) {
    console.error('Start monitoring error:', error);
    if (api.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to start monitoring');
    }
    throw new Error('Network error while starting monitoring');
  }
};

export const stopMonitoring = async (streamName) => {
  try {
    const response = await api.post(`/live/stop`, {
      stream_name: streamName
    });
    return response.data;
  } catch (error) {
    console.error('Stop monitoring error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to stop monitoring');
    }
    throw new Error('Network error while stopping monitoring');
  }
};




export const getUserStreams = async () => {
  try {
    const response = await api.get('/live/livestreams');
    return response.data;
  } catch (error) {
    console.error('Fetch streams error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch streams');
    }
    throw new Error('Network error while fetching streams');
  }
};

export const createStream = async (name, url) => {
  try {
    const response = await api.post('/live/livestreams', {
      stream_name: name,
      stream_url: url
    });
    return response.data;
  } catch (error) {
    console.error('Create stream error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to create stream');
    }
    throw new Error('Network error while creating stream');
  }
};

export const deleteStream = async (id) => {
  try {
    const response = await api.delete(`/live/livestreams/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete stream error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to delete stream');
    }
    throw new Error('Network error while deleting stream');
  }
};
