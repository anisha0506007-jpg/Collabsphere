import api from "./api.js";
export const getProjects=async()=>{
    const response =await api.get("/projects");
    return response.data;
};

export const createProject = async (projectData)=>{
    const response = await api.post("/projects",projectData);
    return response.data;
}

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const addProjectMember = async (projectId, memberData) => {
  const response = await api.post(
    `/projects/${projectId}/members`,
    memberData
  );

  return response.data;
};