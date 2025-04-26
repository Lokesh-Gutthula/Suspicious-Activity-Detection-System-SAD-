import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn);

  if (!isLoggedIn) {
    console.log('Redirecting to /login: Not logged in');
    return <Navigate to="/login" replace />;
  }


  return children;
};

export default ProtectedRoute;