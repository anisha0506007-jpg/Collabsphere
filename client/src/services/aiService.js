
import api from "./api";

export const askAI = async (projectId, requestData) => {
  const response = await api.post(
    `/ai/${projectId}/ask`,
    requestData
  );

  return response.data;
};
