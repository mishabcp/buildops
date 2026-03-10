import api from './axios.js';

export async function getProjectExpenses(projectId) {
  const { data } = await api.get(`/projects/${projectId}/expenses`);
  return data;
}

export async function createExpense(projectId, body) {
  const { data } = await api.post(`/projects/${projectId}/expenses`, body);
  return data;
}

export async function deleteExpense(id) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}
