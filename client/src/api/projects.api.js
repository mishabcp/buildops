import api from './axios.js';

export async function getProjects(params = {}) {
  const { data } = await api.get('/projects', { params });
  return data;
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function getProjectSummary(id) {
  const { data } = await api.get(`/projects/${id}/summary`);
  return data;
}

export async function createProject(body) {
  const { data } = await api.post('/projects', body);
  return data;
}

export async function updateProject(id, body) {
  const { data } = await api.put(`/projects/${id}`, body);
  return data;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
}
