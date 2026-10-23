
import api from "./api";

export const getProjectActivity = async (projectId) => {
  const response = await api.get(`/activity/${projectId}`);
  return response.data;
};

export const getProjectStats = async (projectId) => {
  const response = await api.get(`/activity/${projectId}/stats`);
  return response.data;
};
