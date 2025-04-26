import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { setTokens, clearTokens } from '../api'; // Adjust path if needed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log('Decoded JWT:', decoded);
          setIsLoggedIn(true);
        } catch (err) {
          console.error('Invalid token:', err);
          clearTokens();
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false); // Auth check complete
    };

    initializeAuth();
  }, []); // Empty dependency array, runs once on mount

  const handleLogin = (accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    try {
      setIsLoggedIn(true);
      setLoading(false);
    } catch (err) {
      console.error('Login failed:', err);
      clearTokens();
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Wait until loading is false before rendering children
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);