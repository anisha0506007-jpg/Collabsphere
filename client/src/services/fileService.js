
import api from "./api";

export const getProjectFiles = async (projectId) => {
  const response = await api.get(`/files/${projectId}`);
  return response.data;
};

export const uploadProjectFile = async (projectId, selectedFile) => {
  const formData = new FormData();
  formData.append("file", selectedFile);

  const response = await api.post(
    `/files/${projectId}`,
    formData
  );

  return response.data;
};

export const deleteProjectFile = async (projectId, fileId) => {
  const response = await api.delete(
    `/files/${projectId}/${fileId}`
  );

  return response.data;
};

export const getFileDownloadUrl = (projectId, fileId) => {
  const baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  return `${baseURL}/files/${projectId}/${fileId}`;
};
