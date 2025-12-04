import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  // Debug: Log user data to verify role
  console.log('AdminRoute - User:', user);
  console.log('AdminRoute - User role:', user?.userRole);
  
  // First check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Then check if user is admin (case-insensitive check)
  const isAdmin = user?.userRole?.toLowerCase() === 'admin';
  if (!isAdmin) {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

