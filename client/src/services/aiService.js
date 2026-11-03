import api from "./api";

export const askAI = async (projectId, requestData) => {
  const response = await api.post(
    `/ai/${projectId}/ask`,
    requestData
  );

  return response.data;
};

export const explainWithGemini = async (
  projectId,
  content
) => {
  const response = await api.post("/gemini/explain", {
    projectId,
    content,
  });

  return response.data;
};

export const generateDocsWithGemini = async (
  projectId,
  content
) => {
  const response = await api.post("/gemini/docs", {
    projectId,
    content,
  });

  return response.data;
};

export const generateReadmeWithGemini = async (
  projectId,
  content
) => {
  const response = await api.post("/gemini/readme", {
    projectId,
    content,
  });

  return response.data;
};