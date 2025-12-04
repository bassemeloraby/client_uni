
import axios from "axios";

// Use the production URL for the deployed application
const productionUrl = "https://serveruni1.vercel.app/api/";
// const productionUrl = "http://localho/st:5000/api/";

export const customFetch = axios.create({
  baseURL: productionUrl,
});

// Add a request interceptor to include the auth token in all requests
customFetch.interceptors.request.use(
  (config) => {
    // Get the user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "null");
    
    // If user exists and has a token, add it to the Authorization header
    if (user && user.jwt) {
      config.headers.Authorization = `Bearer ${user.jwt}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
customFetch.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        response: {
          status: 0,
          data: { message: 'Network error. Please check your connection.' }
        }
      });
    }
    
    // Handle 401 Unauthorized errors (authentication required)
    if (error.response.status === 401) {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Only redirect if we're in the browser (not during SSR)
      if (typeof window !== 'undefined') {
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return Promise.reject({
        response: {
          status: 401,
          data: { 
            message: 'Authentication required. Please log in to continue.',
            success: false
          }
        }
      });
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);
