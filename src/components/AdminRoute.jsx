import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  // First check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Then check if user is admin
  const isAdmin = user?.userRole === 'admin';
  if (!isAdmin) {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

