import api from './axios.js';

export async function getAssociates() {
  const { data } = await api.get('/associates');
  return data;
}

export async function createAssociate(body) {
  const { data } = await api.post('/associates', body);
  return data;
}

export async function getProjectAssociates(projectId) {
  const { data } = await api.get(`/projects/${projectId}/associates`);
  return data;
}

export async function assignAssociateToProject(projectId, body) {
  const { data } = await api.post(`/projects/${projectId}/associates`, body);
  return data;
}

export async function recordAssociatePayment(paymentId, body) {
  const { data } = await api.post(`/associate-payments/${paymentId}/transactions`, body);
  return data;
}
