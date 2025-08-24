import { API } from './api';

export const executeCode = async (projectId, codeData) => {
  try {
    const response = await API.post(`/execute/${projectId}`, codeData);
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (errorData?.error?.message) {
      throw new Error(`Execution error: ${errorData.error.message}`);
    } else if (errorData?.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error('Code execution failed - server error');
    }
  }
};