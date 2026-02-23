import axios from 'axios';
import { getAuth } from 'firebase/auth';

// --- Create a new Axios instance ---
const apiClient = axios.create({
  // Set your backend's base URL
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Use an Axios Interceptor to add the token to requests ---
// This function will run before *every* API request is sent
apiClient.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Get the fresh token
      const token = await user.getIdToken();
      console.log(token)
      // Attach it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// --- Handle Response Errors (Optional but Recommended) ---
// This runs after a response is received
apiClient.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Handle errors (e.g., if token is expired, redirect to login)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication error. You might be logged out.");
      // Here you could force a logout or redirect to the login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;