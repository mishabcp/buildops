import api from './axios.js';

export async function getClients(search = '') {
  const params = search ? { search } : {};
  const { data } = await api.get('/clients', { params });
  return data;
}
