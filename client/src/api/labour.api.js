import api from './axios.js';

export async function getLabour(projectId) {
  const { data } = await api.get(`/projects/${projectId}/labour`);
  return data;
}

export async function createLabour(projectId, body) {
  const { data } = await api.post(`/projects/${projectId}/labour`, body);
  return data;
}

export async function updateLabour(id, body) {
  const { data } = await api.put(`/labour/${id}`, body);
  return data;
}

export async function deleteLabour(id) {
  const { data } = await api.delete(`/labour/${id}`);
  return data;
}
