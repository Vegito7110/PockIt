import axios from 'axios';
import { getAuth } from 'firebase/auth';


const apiClient = axios.create({

  baseURL: `${import.meta.env.VITE_API_URL}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      
      const token = await user.getIdToken();
      console.log(token)
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication error. You might be logged out.");

    }
    return Promise.reject(error);
  }
);

export default apiClient;