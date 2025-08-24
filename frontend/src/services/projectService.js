import { API } from './api';

export const createProject = async (projectData) => {
  try {
    const response = await API.post('/projects', projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create project' };
  }
};

export const getUserProjects = async () => {
  try {
    const response = await API.get('/projects');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch projects' };
  }
};

export const getProject = async (projectId) => {
  try {
    const response = await API.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch project' };
  }
};

export const updateProject = async (projectId, updates) => {
  try {
    const response = await API.put(`/projects/${projectId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update project' };
  }
};