import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.233.155.255:8000';
// let API_BASE_URL;

// if (process.env.NODE_ENV === 'development') {
//   // Local dev: use .env value
//   API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.233.155.255:8000';
// } else {
//   // Production: proxy through frontend domain
//   API_BASE_URL = '/api';
// }

console.log("The API_BASE_URL is: ", process.env.REACT_APP_API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      logout();
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Agent Management APIs
export const createAgent = async (agentData) => {
  const response = await api.post('/api/agents/create', agentData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAgent = async (agentName) => {
  const response = await api.get(`/api/agents/${agentName}`);
  return response.data;
};

export const updateAgent = async (agentName, updateData) => {
  const response = await api.put(`/api/agents/${agentName}`, updateData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAgent = async (agentName) => {
  const response = await api.delete(`/api/agents/${agentName}`);
  return response.data;
};

export const listAgents = async (params = {}) => {
  const response = await api.get('/api/agents', { params });
  return response.data;
};

// Document Validation API
export const validateDocument = async (agentName, formData) => {
  const response = await api.post(`/api/agent/${agentName}/validate`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// New function for cross-validation
export const validateDocumentWithSupporting = async (agentName, formData) => {
  const response = await api.post(
    `/api/agent/${agentName}/validate-supporting`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};


// Analytics APIs
export const getAgentsByCreator = async (creatorId, params = {}) => {
  const response = await api.get(`/api/creator/${creatorId}/agents`, { params });
  return response.data;
};

export const getAgentUsers = async (agentName, params = {}) => {
  const response = await api.get(`/api/agent/${agentName}/users`, { params });
  return response.data;
};

export const getAgentStats = async (agentName) => {
  const response = await api.get(`/api/agent/${agentName}/stats`);
  return response.data;
};

export const getCreatorStats = async (creatorId) => {
  const response = await api.get(`/api/creator/${creatorId}/stats`);
  return response.data;
};

export const getAgentHitCount = async (agentName) => {
  const response = await api.get(`/api/agent/${agentName}/count`);
  return response.data;
};

// Authentication API
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export default api;

