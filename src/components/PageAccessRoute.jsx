import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * PageAccessRoute - Checks if the user has access to the current page
 * Admins have access to all pages
 * Non-admin users can only access pages in their allowedPages array
 */
const PageAccessRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const currentPath = location.pathname;

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Admins have access to all pages
  const isAdmin = user?.userRole?.toLowerCase() === 'admin';
  if (isAdmin) {
    return children;
  }

  // Check if user has access to the current page
  const allowedPages = user?.allowedPages || [];
  const hasAccess = allowedPages.includes(currentPath);

  if (!hasAccess) {
    // Redirect to home page if user doesn't have access
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PageAccessRoute;

