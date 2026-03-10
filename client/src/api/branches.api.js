import api from './axios.js';

export async function getBranches() {
  const { data } = await api.get('/branches');
  return data;
}

export async function createBranch(body) {
  const { data } = await api.post('/branches', body);
  return data;
}

export async function updateBranch(id, body) {
  const { data } = await api.put(`/branches/${id}`, body);
  return data;
}
