import api from './axios.js';

export async function getStages(projectId) {
  const { data } = await api.get(`/projects/${projectId}/stages`);
  return data;
}

export async function createStage(projectId, body) {
  const { data } = await api.post(`/projects/${projectId}/stages`, body);
  return data;
}

export async function updateStage(stageId, body) {
  const { data } = await api.put(`/stages/${stageId}`, body);
  return data;
}

export async function deleteStage(stageId) {
  const { data } = await api.delete(`/stages/${stageId}`);
  return data;
}

export async function getReceipts(stageId) {
  const { data } = await api.get(`/stages/${stageId}/receipts`);
  return data;
}

export async function createReceipt(stageId, body) {
  const { data } = await api.post(`/stages/${stageId}/receipts`, body);
  return data;
}
