
import axios from "axios";

// Use the production URL for the deployed application
// const productionUrl = "https://serveruni1.vercel.app/api/";
const productionUrl = "http://localhost:5000/api/";

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
    
    // Handle other errors
    return Promise.reject(error);
  }
);
