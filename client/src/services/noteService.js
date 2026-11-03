import api from "./api";

export const getProjectNotes = async (projectId) => {
  const response = await api.get(`/notes/${projectId}`);
  return response.data;
};

export const createNote = async (projectId, noteData) => {
  const response = await api.post(
    `/notes/${projectId}`,
    noteData
  );

  return response.data;
};

export const updateNote = async (
  projectId,
  noteId,
  noteData
) => {
  const response = await api.patch(
    `/notes/${projectId}/${noteId}`,
    noteData
  );

  return response.data;
};

export const deleteNote = async (projectId, noteId) => {
  const response = await api.delete(
    `/notes/${projectId}/${noteId}`
  );

  return response.data;
};