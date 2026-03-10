import api from './axios.js';

export async function getUsers() {
  const { data } = await api.get('/users');
  return data;
}

export async function createUser(body) {
  const { data } = await api.post('/users', body);
  return data;
}

export async function updateUser(id, body) {
  const { data } = await api.put(`/users/${id}`, body);
  return data;
}

export async function deactivateUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
