import api from './axios.js';

export async function getMaterials() {
  const { data } = await api.get('/materials');
  return data;
}

export async function createMaterial(body) {
  const { data } = await api.post('/materials', body);
  return data;
}

export async function updateMaterial(id, body) {
  const { data } = await api.put(`/materials/${id}`, body);
  return data;
}

export async function getProjectMaterials(projectId) {
  const { data } = await api.get(`/projects/${projectId}/materials`);
  return data;
}

export async function createMaterialItem(projectId, body) {
  const { data } = await api.post(`/projects/${projectId}/materials`, body);
  return data;
}

export async function deleteMaterialItem(id) {
  const { data } = await api.delete(`/material-items/${id}`);
  return data;
}
