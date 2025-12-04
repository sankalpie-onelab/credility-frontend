import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agent Management APIs
export const createAgent = async (agentData) => {
  const response = await api.post('/api/agents/create', agentData);
  return response.data;
};

export const getAgent = async (agentName) => {
  const response = await api.get(`/api/agents/${agentName}`);
  return response.data;
};

export const updateAgent = async (agentName, updateData) => {
  const response = await api.put(`/api/agents/${agentName}`, updateData);
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

export default api;

