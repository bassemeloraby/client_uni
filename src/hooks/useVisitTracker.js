import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { customFetch } from '../utils';

/**
 * Hook to automatically track page visits
 * Should be used in the main layout component
 */
export const useVisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track if user is authenticated
    const user = JSON.parse(localStorage.getItem("user") || "null");
    
    if (!user || !user.jwt) {
      return; // Don't track visits for unauthenticated users
    }

    // Don't track visits to the visits page itself
    if (location.pathname === '/visits') {
      return;
    }

    // Track the visit
    const trackVisit = async () => {
      try {
        await customFetch.post('visits', {
          path: location.pathname,
          method: 'GET',
          userAgent: navigator.userAgent,
          referer: document.referrer,
        });
      } catch (error) {
        // Silently fail - we don't want to interrupt user experience
        console.error('Failed to track visit:', error);
      }
    };

    // Small delay to ensure page is loaded
    const timeoutId = setTimeout(trackVisit, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

export default useVisitTracker;

