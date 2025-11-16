// API client with authentication headers
// Example implementation for making authenticated API requests
// No unnecessary spaces around operators per user preference

import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {getAuthHeaders, isTokenValid, getToken, removeToken} from './auth';

// Create axios instance with default configuration
const apiClient:AxiosInstance=axios.create({
  baseURL:process.env.API_URL || 'http://localhost:3000',
  timeout:30000,
  headers:{
    'Content-Type':'application/json'
  }
});

// Request interceptor to add authentication headers
apiClient.interceptors.request.use(
  (config)=>{
    // Add auth headers (includes API key and JWT token if available)
    const authHeaders=getAuthHeaders();
    config.headers=config.headers || {};
    
    Object.keys(authHeaders).forEach((key)=>{
      config.headers[key]=authHeaders[key];
    });

    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error)=>{
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response)=>{
    return response;
  },
  (error)=>{
    // Handle 401 Unauthorized errors
    if(error.response && error.response.status===401){
      console.error('Authentication error: Token invalid or expired');
      
      // Check if token is actually invalid
      const token=getToken();
      if(token && !isTokenValid(token)){
        // Token expired, clear it and redirect to signin
        removeToken();
        window.location.href='/signin';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Example usage in components:
/*
import apiClient from '../utils/apiClient';

const fetchUserData=async ()=>{
  try{
    const response=await apiClient.get('/v0/auth/me');
    return response.data;
  }catch(error){
    console.error('Error fetching user data:', error);
    throw error;
  }
};

const updateProfile=async (data)=>{
  try{
    const response=await apiClient.put('/v0/users/profile', data);
    return response.data;
  }catch(error){
    console.error('Error updating profile:', error);
    throw error;
  }
};
*/

