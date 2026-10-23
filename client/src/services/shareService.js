
import api from "./api";

export const enableProjectSharing = async (projectId) => {
  return (
    await api.post(`/share/${projectId}/enable`)
  ).data;
};

export const disableProjectSharing = async (projectId) => {
  return (
    await api.delete(`/share/${projectId}/disable`)
  ).data;
};

export const getPublicProject = async (token) => {
  return (
    await api.get(`/public/projects/${token}`)
  ).data;
};
