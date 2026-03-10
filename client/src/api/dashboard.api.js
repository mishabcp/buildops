import api from './axios.js';

export async function getDashboard(params = {}) {
  const { data } = await api.get('/dashboard', { params });
  return data;
}
