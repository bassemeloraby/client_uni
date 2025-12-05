import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminOrSupervisorRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  // First check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is admin or pharmacy supervisor (case-insensitive check)
  const userRole = user?.userRole?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isSupervisor = userRole === 'pharmacy supervisor';
  
  if (!isAdmin && !isSupervisor) {
    // Redirect to home if not admin or supervisor
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminOrSupervisorRoute;
