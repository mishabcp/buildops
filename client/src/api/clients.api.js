import api from './axios.js';

export async function getClients(search = '') {
  const params = search ? { search } : {};
  const { data } = await api.get('/clients', { params });
  return data;
}

export async function createClient(body) {
  const { data } = await api.post('/clients', body);
  return data;
}

export async function updateClient(id, body) {
  const { data } = await api.put(`/clients/${id}`, body);
  return data;
}

export async function deleteClient(id) {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
}
